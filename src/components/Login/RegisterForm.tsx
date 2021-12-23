import React from 'react';
import * as Yup from 'yup';
import { IRegisterData } from 'views/Login';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import {
	Button,
	FormControl,
	FormErrorMessage,
	FormLabel,
	Input,
	Stack,
} from '@chakra-ui/react';

interface IRegister {
	username: string;
	email: string;
	password: string;
}

interface IRegisterFormProps {
	initialUsername?: string;
	initialEmail?: string;
	initialPassword?: string;
	submit({ email, username, password }: IRegisterData): Promise<void>;
}

const schema = Yup.object({
	email: Yup.string().email().required('A valid email is required!'),
	password: Yup.string().min(8).required('Please enter your password!'),
	username: Yup.string().min(3).required('Please a username'),
});

const RegisterForm: React.FC<IRegisterFormProps> = ({
	initialEmail,
	initialPassword,
	initialUsername,
	submit,
}) => {
	const {
		handleSubmit,
		formState: { errors, isSubmitting },
		register,
	} = useForm<IRegister>({
		resolver: yupResolver(schema),
		defaultValues: {
			email: initialEmail,
			password: initialPassword,
			username: initialUsername,
		},
	});

	return (
		<form onSubmit={handleSubmit(submit)}>
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
				<FormControl isInvalid={!!errors.username}>
					<FormLabel>Username</FormLabel>
					<Input
						type="text"
						disabled={isSubmitting}
						{...register('username')}
					/>
					<FormErrorMessage>
						{errors.username && errors.username.message}
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
					Register
				</Button>
			</Stack>
		</form>
	);
};

export default RegisterForm;
