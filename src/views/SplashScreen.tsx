import React, { useState } from 'react';
import LoginForm from '@components/Login/LoginForm';
import RegisterForm from '@components/Login/RegisterForm';
import {
	Alert,
	Box,
	Grid,
	Link,
	Paper,
	Stack,
	Typography,
} from '@mui/material';
import { LS_TOKEN_POINTER } from 'api/api.service';
import { login, register } from 'api/user.service';
import { isApiResponse } from 'Document/Utility';
import { IRegisterData } from './Login';
import { useQueryClient } from 'react-query';
import { useNavigate } from 'react-router';

const SplashScreen: React.FC = () => {
	const queryClient = useQueryClient();
	const [errors, setErrors] = useState(new Array<string>());
	const navigate = useNavigate();

	const [isLoading, setIsLoading] = useState(false);
	const [isRegister, setRegister] = useState<boolean>(false);
	const [infoMsg, setInfoMsg] = useState<string>('');

	const toggleRegister = () => {
		setRegister(!isRegister);
	};

	const loginCB = async (loginData: { email: string; password: string }) => {
		setErrors([]);
		setInfoMsg('');
		setIsLoading(true);
		try {
			const { token } = await login(loginData);
			localStorage.setItem(LS_TOKEN_POINTER, token);
			queryClient.invalidateQueries('user');
			navigate('/home');
		} catch (e) {
			if (isApiResponse(e)) {
				const { message } = e;
				setErrors((stateErrors) => [...stateErrors, message]);
			} else {
				const unknownErrorMessage = 'An unknown Error has occurred';
				setErrors((stateErrors) => [
					...stateErrors,
					unknownErrorMessage,
				]);
			}
		}
		setIsLoading(false);
	};

	const registerCB = async (registerData: IRegisterData) => {
		setErrors([]);
		setInfoMsg('');
		setIsLoading(true);
		try {
			await register(registerData);
			setInfoMsg(
				'Registration complete! Please check your emails and validate your Account'
			);
			setRegister(false);
		} catch (e) {
			if (e instanceof Error) {
				const { message } = e;
				setErrors((stateErrors) => [...stateErrors, message]);
			}
		}
		setIsLoading(false);
	};

	return (
		<Box
			sx={(theme) => ({
				height: '100vh',
				background: `linear-gradient(145deg, ${theme.palette.primary.main} 45%, ${theme.palette.secondary.main} 45.1%)`,
			})}
		>
			<Box sx={{ pl: 6, pt: 6 }}>
				<img src="/yilang-logo.png" width="35%"></img>
			</Box>
			<Paper
				elevation={3}
				sx={{
					position: 'absolute',
					bottom: { sm: 30, md: 100 },
					right: { sm: 30, md: 250 },
					p: 3,
					width: '400px',
				}}
			>
				<Stack spacing={4} alignItems="center">
					{errors.length > 0 && (
						<Alert severity="error" sx={{ width: '100%' }}>
							{errors.map((err) => (
								<span>{err}</span>
							))}
						</Alert>
					)}
					{infoMsg && (
						<Alert severity="info" sx={{ width: '100%' }}>
							{infoMsg}
						</Alert>
					)}
					<Box sx={{ width: '100%' }}>
						{isRegister ? (
							<RegisterForm submit={registerCB} />
						) : (
							<LoginForm
								initialEmail=""
								initialPassword=""
								submit={loginCB}
							/>
						)}
					</Box>
					<Link
						component="button"
						variant="body2"
						onClick={toggleRegister}
					>
						Need to {isRegister ? ' login' : ' register'}?
					</Link>
				</Stack>
			</Paper>
		</Box>
	);
};

export default SplashScreen;
