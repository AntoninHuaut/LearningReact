import { Anchor, Button, Container, Paper, Text, Title } from '@mantine/core';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Key } from 'tabler-icons-react';

import { useFetch } from '../../hooks/useFetch';
import { registerRequest } from '../../api/user_request';
import { ConfirmPassword } from '../../components/form/ConfirmPassword';
import { EmailInput, isValidEmail } from '../../components/form/EmailInput';
import { isValidPassword, PasswordStrength } from '../../components/form/PasswordStength';
import { isValidUsername, UsernameInput } from '../../components/form/UsernameInput';
import { useCaptcha } from '../../hooks/useCaptcha';
import { handleInputChange } from '../../services/form.service';
import { safeTrack } from '../../services/umami.service';
import { CaptchaAction } from '../../types/CaptchaType';
import { IRegisterRequest } from '../../types/LoginType';
import { errorNotif, successNotif } from '../../services/notification.services';

export function RegisterPage() {
    const navigate = useNavigate();
    const registerFetch = useFetch({
        onError(error) {
            errorNotif({
                title: 'An error occurred during register',
                message: error.message,
            });
        },
        onData(_data) {
            setAccountCreated(true);
            safeTrack('created', 'account');
            const autoCloseDelay = successNotif({
                title: 'Your account has been created!',
                message: "You will be redirected to the login page. Don't forget to check your email to activate your account.",
            });

            setTimeout(() => navigate('/login'), autoCloseDelay);
        },
    });

    const [register, setRegister] = useState<IRegisterRequest>({ email: '', username: '', password: '', confirmPassword: '' });
    const [isRegisterEnable, setRegisterEnable] = useState(false);
    const [isAccountCreated, setAccountCreated] = useState(false);

    const onSubmit = useCaptcha(CaptchaAction.Register, async (captcha: string) => {
        await registerFetch.makeRequest(registerRequest(register, captcha));
        onSubmit(false);
    });

    useEffect(
        () =>
            setRegisterEnable(
                isValidEmail(register.email) &&
                    isValidUsername(register.username) &&
                    isValidPassword(register.password) &&
                    register.password === register.confirmPassword
            ),
        [register]
    );

    return (
        <Container size={420} my={40}>
            <Title align="center" sx={(theme) => ({ fontFamily: `Greycliff CF, ${theme.fontFamily}`, fontWeight: 900 })}>
                Welcome!
            </Title>
            <Text color="dimmed" size="sm" align="center" mt={5}>
                Already have an account?{' '}
                <Anchor<'a'>
                    href="/login"
                    size="sm"
                    onClick={(evt) => {
                        evt.preventDefault();
                        safeTrack('sign-in', 'link');
                        navigate('/login');
                    }}>
                    Sign in
                </Anchor>
            </Text>

            <Paper mt={30} radius="xl" p="lg" shadow="xl">
                <EmailInput
                    value={register.email}
                    disabled={registerFetch.isLoading || isAccountCreated}
                    onChange={(evt) => handleInputChange<IRegisterRequest>(evt, setRegister)}
                />

                <UsernameInput
                    mt="md"
                    value={register.username}
                    disabled={registerFetch.isLoading || isAccountCreated}
                    onChange={(evt) => handleInputChange<IRegisterRequest>(evt, setRegister)}
                />

                <PasswordStrength
                    mt="md"
                    label="Password"
                    name="password"
                    icon={<Key />}
                    placeholder="Your password"
                    value={register.password}
                    disabled={registerFetch.isLoading || isAccountCreated}
                    onChange={(evt) => handleInputChange<IRegisterRequest>(evt, setRegister)}
                />

                <ConfirmPassword
                    mt="md"
                    password={register.password}
                    confirmPassword={register.confirmPassword}
                    onChange={(evt) => handleInputChange<IRegisterRequest>(evt, setRegister)}
                    disabled={registerFetch.isLoading || isAccountCreated}
                />

                <Button
                    className="umami--click--register"
                    fullWidth
                    mt="xl"
                    onClick={() => onSubmit(true)}
                    loading={registerFetch.isLoading}
                    disabled={!isRegisterEnable || isAccountCreated}>
                    Register
                </Button>
            </Paper>
        </Container>
    );
}
