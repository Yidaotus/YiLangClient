import React from 'react';
import * as Yup from 'yup';
import { ILoginData } from 'views/Login';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, Controller } from 'react-hook-form';
import { Stack, TextField } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';

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
		formState: { isSubmitting },
		control,
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
				<Controller
					name="email"
					control={control}
					defaultValue=""
					render={({ field, fieldState: { error } }) => (
						<TextField
							{...field}
							disabled={isSubmitting}
							error={!!error}
							variant="outlined"
							helperText={error?.message || null}
							label="Email"
							placeholder="Email"
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
							disabled={isSubmitting}
							type="password"
							variant="outlined"
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
					Sign In
				</LoadingButton>
			</Stack>
		</form>
	);
};

export default LoginForm;
