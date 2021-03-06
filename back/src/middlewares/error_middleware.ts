import { Context, isHttpError, Middleware, Status } from 'oak';
import { ZodError } from 'zod';

import { config } from '/config.ts';

const error: Middleware = async (ctx: Context, next: () => Promise<unknown>) => {
    try {
        await next();
    } catch (err) {
        let status = err.status || err.statusCode || Status.InternalServerError;
        let message = err.message;

        if (err instanceof ZodError) {
            message = JSON.parse(err.message);
            status = 400;
        } else if (!isHttpError(err) || !err.expose) {
            message = config.ENV === 'dev' ? message : 'Internal Server Error';
        }

        if (config.ENV === 'dev') {
            console.error(status, ctx.request.url.href, err);
        } else if (status > 499) {
            await Deno.writeTextFile('./data/error.log', `${status} ${ctx.request.url.href}\n${err}\n`);
        }

        ctx.response.status = status;
        ctx.response.body = { status, message };
    }
};

export default error;
