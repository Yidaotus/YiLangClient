import './Login.css';

import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Button, Col, Row, Spin } from 'antd';
import RegisterForm from 'components/Login/RegisterFormAnt';
import UIError from 'components/Error/UIError';
import { IUIError } from 'store/ui/types';
import { getUUID } from 'Document/UUID';
import { IRootDispatch } from '@store/index';
import LoginForm from '../components/Login/LoginFormAnt';
import {
	login as loginDispatcher,
	register as registerDispatcher,
} from '../store/user/actions';

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
	const history = useHistory();

	const [isLoading, setIsLoading] = useState(false);
	const [errors, setErrors] = useState(new Array<IUIError>());

	const [isRegister, setRegister] = useState<boolean>(false);
	const [infoMsg, setInfoMsg] = useState<string>('');

	const dispatch: IRootDispatch = useDispatch();

	const toggleRegister = () => {
		setRegister(!isRegister);
	};

	const loginCB = async (loginData: { email: string; password: string }) => {
		setIsLoading(true);
		try {
			await dispatch(loginDispatcher(loginData));
			history.push('/');
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
		dispatch(registerDispatcher(registerData));
		setInfoMsg(
			'Registration complete! Please check your emails and validate your Account'
		);
		setRegister(false);
	};

	return (
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
