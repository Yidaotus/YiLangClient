import React from 'react';
import * as Yup from 'yup';
import { IRegisterData } from 'views/Login';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, Controller } from 'react-hook-form';
import { Stack, TextField } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';

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
		formState: { isSubmitting },
		control,
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
			<Stack spacing={2}>
				<Controller
					name="email"
					control={control}
					defaultValue=""
					render={({ field, fieldState: { error } }) => (
						<TextField
							{...field}
							error={!!error}
							disabled={isSubmitting}
							variant="outlined"
							helperText={error?.message || null}
							label="Email"
							placeholder="Email"
						/>
					)}
				/>
				<Controller
					name="username"
					control={control}
					defaultValue=""
					render={({ field, fieldState: { error } }) => (
						<TextField
							{...field}
							error={!!error}
							variant="outlined"
							disabled={isSubmitting}
							helperText={error?.message || null}
							label="Username"
							placeholder="Username"
						/>
					)}
				/>
				<Controller
					name="password"
					control={control}
					defaultValue=""
					render={({ field, fieldState: { error } }) => (
						<TextField
							{...field}
							error={!!error}
							type="password"
							variant="outlined"
							disabled={isSubmitting}
							helperText={error?.message || null}
							label="Password"
							placeholder="Password"
						/>
					)}
				/>
				<LoadingButton
					loading={isSubmitting}
					type="submit"
					variant="contained"
				>
					Register
				</LoadingButton>
			</Stack>
		</form>
	);
};

export default RegisterForm;
