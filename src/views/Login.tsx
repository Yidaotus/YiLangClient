import './Login.css';

import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import RegisterForm from 'components/Login/RegisterForm';
import { useUserContext } from '@hooks/useUserContext';
import { LS_TOKEN_POINTER } from 'api/api.service';
import { useQueryClient } from 'react-query';
import { login, register } from 'api/user.service';
import { Paper, Box, Stack, Grid, Alert, Button, Link } from '@mui/material';
import LoginForm from '../components/Login/LoginForm';

export interface IRegisterData {
	email: string;
	username: string;
	password: string;
}

export interface ILoginData {
	email: string;
	password: string;
}

const LoginView: React.FC = () => {
	const queryClient = useQueryClient();
	const user = useUserContext();

	const [isLoading, setIsLoading] = useState(false);
	const [errors, setErrors] = useState(new Array<string>());

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
		} catch (e) {
			if (e instanceof Error) {
				const { message } = e;
				setErrors((stateErrors) => [...stateErrors, message]);
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

	return user ? (
		<Navigate to="/home" replace />
	) : (
		<Grid
			container
			direction="row"
			alignItems="center"
			justifyContent="center"
			height="100vh"
		>
			<Paper
				elevation={3}
				sx={{
					p: 3,
					width: '400px',
				}}
			>
				<Stack spacing={4} alignItems="center">
					<img src="yilang.png" alt="YiText" width="200px" />
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
		</Grid>
	);
};

export default LoginView;
