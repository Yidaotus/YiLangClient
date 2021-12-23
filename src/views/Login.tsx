import './Login.css';

import React, { useState } from 'react';
import { Redirect } from 'react-router-dom';
import RegisterForm from 'components/Login/RegisterForm';
import { useUserContext } from '@hooks/useUserContext';
import { LS_TOKEN_POINTER } from 'api/api.service';
import { useQueryClient } from 'react-query';
import { login, register } from 'api/user.service';
import { Flex, Box, Spinner, Button, Stack, Link } from '@chakra-ui/react';
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
		await register(registerData);
		setInfoMsg(
			'Registration complete! Please check your emails and validate your Account'
		);
		setRegister(false);
	};

	return user ? (
		<Redirect to="/home" />
	) : (
		<Flex minH="100vh" align="center" justify="center">
			<Box rounded="lg" boxShadow="md" p={8} minWidth={400}>
				<Stack spacing={4}>
					<div className="login-logo">
						<img src="yilang.png" alt="YiText" />
					</div>
					{isLoading && (
						<Spinner
							thickness="4px"
							speed="0.65s"
							emptyColor="gray.200"
							color="blue.500"
							size="xl"
						/>
					)}
					{isRegister ? (
						<RegisterForm submit={registerCB} />
					) : (
						<LoginForm
							initialEmail=""
							initialPassword=""
							submit={loginCB}
						/>
					)}
					<div className="sub-form">
						<p>
							Need to
							<Link
								color="green.500"
								onClick={toggleRegister}
								onKeyDown={toggleRegister}
							>
								{isRegister ? ' login' : ' register'}?
							</Link>
						</p>
					</div>
					{errors.length > 0 && (
						<div className="flex justify-center pt-4">
							<span className="text-md text-red-600">
								{errors.map((err) => (
									<span>{err}</span>
								))}
							</span>
						</div>
					)}
					{infoMsg && (
						<div className="flex justify-center pt-4">
							<span className="text-md text-green-600">
								{infoMsg}
							</span>
						</div>
					)}
				</Stack>
			</Box>
		</Flex>
	);
};

export default LoginView;
