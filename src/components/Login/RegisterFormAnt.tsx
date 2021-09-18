import { Button, Form, Input } from 'antd';
import React from 'react';
import { IRegisterData } from 'views/Login';

interface IRegisterFormProps {
	initialUsername?: string;
	initialEmail?: string;
	initialPassword?: string;
	register({ email, username, password }: IRegisterData): Promise<void>;
}

const RegisterForm: React.FC<IRegisterFormProps> = ({
	initialEmail,
	initialPassword,
	initialUsername,
	register,
}) => {
	return (
		<Form
			name="basic"
			labelCol={{ span: 8 }}
			wrapperCol={{ span: 16 }}
			initialValues={{ remember: true }}
			onFinish={register}
			autoComplete="off"
		>
			<Form.Item
				label="Username"
				name="username"
				rules={[
					{ required: true, message: 'Please input your username!' },
				]}
			>
				<Input placeholder={initialUsername} />
			</Form.Item>

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
					Register
				</Button>
			</Form.Item>
		</Form>
	);
};

export default RegisterForm;
