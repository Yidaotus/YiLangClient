import React from 'react';
import { ILoginData } from 'views/Login';
import { Button, Form, Input } from 'antd';

interface ILoginFormProps {
	initialEmail: string;
	initialPassword: string;
	login({ email, password }: ILoginData): Promise<void>;
}

const LoginForm: React.FC<ILoginFormProps> = ({
	initialEmail,
	initialPassword = '',
	login,
}: ILoginFormProps) => {
	return (
		<Form
			name="basic"
			labelCol={{ span: 8 }}
			wrapperCol={{ span: 16 }}
			initialValues={{ remember: true }}
			onFinish={login}
			autoComplete="off"
		>
			<Form.Item
				label="Email"
				name="email"
				rules={[
					{ required: true, message: 'Please input your email!' },
				]}
			>
				<Input placeholder={initialEmail} />
			</Form.Item>

			<Form.Item
				label="Password"
				name="password"
				rules={[
					{ required: true, message: 'Please input your password!' },
				]}
			>
				<Input.Password placeholder={initialPassword} />
			</Form.Item>

			<Form.Item wrapperCol={{ offset: 8, span: 16 }}>
				<Button type="primary" htmlType="submit">
					Login
				</Button>
			</Form.Item>
		</Form>
	);
};

export default LoginForm;
