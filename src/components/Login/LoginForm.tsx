import React from 'react';
import * as Yup from 'yup';
import { ILoginData } from 'views/Login';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import {
	Stack,
	Button,
	FormControl,
	FormErrorMessage,
	FormLabel,
	Input,
} from '@chakra-ui/react';

interface ILogin {
	email: string;
	password: string;
}

interface ILoginFormProps {
	initialEmail: string;
	initialPassword: string;
	submit({ email, password }: ILoginData): Promise<void>;
}

const schema = Yup.object({
	email: Yup.string().email().required('A valid email is required!'),
	password: Yup.string().min(8).required('Please enter your password!'),
});

const LoginForm: React.FC<ILoginFormProps> = ({
	initialEmail,
	initialPassword = '',
	submit,
}: ILoginFormProps) => {
	const {
		handleSubmit,
		formState: { errors, isSubmitting },
		register,
	} = useForm<ILogin>({
		resolver: yupResolver(schema),
		defaultValues: {
			email: initialEmail,
			password: initialPassword,
		},
	});

	return (
		<form onSubmit={handleSubmit(submit)} noValidate>
			<Stack spacing={4}>
				<FormControl isInvalid={!!errors.email}>
					<FormLabel>Email address</FormLabel>
					<Input
						type="email"
						disabled={isSubmitting}
						{...register('email')}
					/>
					<FormErrorMessage>
						{errors.email && errors.email.message}
					</FormErrorMessage>
				</FormControl>
				<FormControl isInvalid={!!errors.password}>
					<FormLabel>Password</FormLabel>
					<Input
						type="password"
						disabled={isSubmitting}
						{...register('password')}
					/>
					<FormErrorMessage>
						{errors.password && errors.password.message}
					</FormErrorMessage>
				</FormControl>
				<Button isLoading={isSubmitting} type="submit">
					Sign In
				</Button>
			</Stack>
		</form>
	);
};

export default LoginForm;
