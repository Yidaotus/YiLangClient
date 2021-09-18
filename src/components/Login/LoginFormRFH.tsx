import React from 'react';
import * as Yup from 'yup';
import { ILoginData } from 'views/Login';
import { yupResolver } from '@hookform/resolvers';
import { Controller, useForm } from 'react-hook-form';
import { Button, Col, Input, Row } from 'antd';

interface ILogin {
	email: string;
	password: string;
}

interface ILoginFormProps {
	initialEmail: string;
	initialPassword: string;
	login({ email, password }: ILoginData): Promise<void>;
}

const schema = Yup.object({
	email: Yup.string().email().required('A valid email is required!'),
	password: Yup.string().min(8).required('Please enter your password!'),
});

const LoginForm: React.FC<ILoginFormProps> = ({
	initialEmail,
	initialPassword = '',
	login,
}: ILoginFormProps) => {
	const { handleSubmit, formState, control } = useForm<ILogin>({
		resolver: yupResolver(schema),
		defaultValues: {
			email: initialEmail,
			password: initialPassword,
		},
	});

	const { isSubmitting } = formState;

	return (
		<Row>
			<Col>
				<div>
					Sign in
					<form onSubmit={handleSubmit(login)} noValidate>
						<Controller
							as={Input}
							control={control}
							required
							id="email"
							name="email"
							autoComplete="email"
							disabled={isSubmitting}
							autoFocus
						/>
						<Controller
							as={Input}
							control={control}
							required
							name="password"
							type="password"
							id="password"
							disabled={isSubmitting}
							autoComplete="current-password"
						/>
						<Button
							type="primary"
							htmlType="submit"
							disabled={isSubmitting}
						>
							Sign In
						</Button>
					</form>
				</div>
			</Col>
		</Row>
	);
};

export default LoginForm;
