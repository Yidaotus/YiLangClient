import './Login.css';

import React, { useState } from 'react';
import { Redirect } from 'react-router-dom';
import { Button, Col, Row, Spin } from 'antd';
import RegisterForm from 'components/Login/RegisterFormAnt';
import UIError from 'components/Error/UIError';
import { IUIError } from 'store/ui/types';
import { getUUID } from 'Document/UUID';
import useAuth from '@hooks/useAuth';
import { LS_TOKEN_POINTER } from 'api/api.service';
import { useQueryClient } from 'react-query';
import { login, register } from 'api/user.service';
import LoginForm from '../components/Login/LoginFormAnt';

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
	const user = useAuth();

	const [isLoading, setIsLoading] = useState(false);
	const [errors, setErrors] = useState(new Array<IUIError>());

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
				setErrors((stateErrors) => [
					...stateErrors,
					{ message, id: getUUID(), type: 'error' },
				]);
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
		<Row justify="center">
			<Col span={6}>
				<div className="login-logo">
					<img src="yilang.png" alt="YiText" />
				</div>
				<Spin spinning={isLoading}>
					{isRegister ? (
						<RegisterForm register={registerCB} />
					) : (
						<LoginForm
							initialEmail=""
							initialPassword=""
							login={loginCB}
						/>
					)}
				</Spin>
				<div className="sub-form">
					<p>
						Need to
						<Button
							size="small"
							type="link"
							onClick={toggleRegister}
							onKeyDown={toggleRegister}
						>
							{isRegister ? ' login' : ' register'}?
						</Button>
					</p>
				</div>
				{errors.length > 0 && (
					<div className="flex justify-center pt-4">
						<span className="text-md text-red-600">
							{errors.map((err) => (
								<UIError {...err} />
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
			</Col>
		</Row>
	);
};

export default LoginView;
