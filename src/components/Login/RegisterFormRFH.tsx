import React from 'react';
import { withFormik, FormikProps } from 'formik';
import * as Yup from 'yup';
import { IRegisterData } from 'views/Login';

interface IRegister {
	username: string;
	email: string;
	password: string;
}

interface IRegisterFormProps {
	initialUsername?: string;
	initialEmail?: string;
	initialPassword?: string;
	register({ email, username, password }: IRegisterData): Promise<void>;
}

const RegisterForm = (props: FormikProps<IRegister>) => {
	const {
		values,
		errors,
		touched,
		handleChange,
		handleBlur,
		handleSubmit,
		isSubmitting,
	} = props;

	return (
		<form onSubmit={handleSubmit}>
			<div className="mb-4">
				<label
					className="block text-gray-700 text-sm font-bold mb-2"
					htmlFor="username"
				>
					Email
					<input
						className={`yi-input ${
							errors.email && touched.email
								? 'yi-input-error'
								: ''
						}`}
						id="email"
						type="text"
						value={values.email}
						onBlur={handleBlur}
						onChange={handleChange}
						placeholder="Email"
						disabled={isSubmitting}
					/>
				</label>
				{errors.email && touched.email && (
					<p className="text-red-500 text-xs italic">
						{errors.email}
					</p>
				)}
			</div>
			<div className="mb-4">
				<label
					className="block text-gray-700 text-sm font-bold mb-2"
					htmlFor="username"
				>
					Username
					<input
						className={`yi-input ${
							errors.username && touched.username
								? 'yi-input-error'
								: ''
						}`}
						id="username"
						type="text"
						value={values.username}
						onChange={handleChange}
						onBlur={handleBlur}
						placeholder="Username"
						disabled={isSubmitting}
					/>
				</label>
				{errors.username && touched.username && (
					<p className="text-red-500 text-xs italic">
						{errors.username}
					</p>
				)}
			</div>
			<div className="mb-6">
				<label
					className="block text-gray-700 text-sm font-bold mb-2"
					htmlFor="password"
				>
					Password
					<input
						className={`yi-input ${
							errors.password && touched.password
								? 'yi-input-error'
								: ''
						}`}
						id="password"
						type="password"
						value={values.password}
						onChange={handleChange}
						onBlur={handleBlur}
						placeholder="*********"
						disabled={isSubmitting}
					/>
				</label>
				{errors.password && touched.password && (
					<p className="text-red-500 text-xs italic">
						{errors.password}
					</p>
				)}
			</div>
			<div className="flex items-center justify-between">
				<p className="inline-block align-baseline font-bold text-sm text-shibuya-100 hover:text-shibuya-300">
					Forgot Password?
				</p>
				<button
					className="bg-shibuya-100 hover:bg-shibuya-100 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
					type="submit"
				>
					Register
				</button>
			</div>
		</form>
	);
};

const RegisterFormComp = withFormik<IRegisterFormProps, IRegister>({
	mapPropsToValues: (props) => ({
		username: props.initialUsername || '',
		email: props.initialEmail || '',
		password: props.initialPassword || '',
	}),

	validationSchema: Yup.object({
		username: Yup.string().required('Username is required!'),
		email: Yup.string().email().required('A valid email is required!'),
		password: Yup.string()
			.min(8)
			.required(
				'A valid password with at least 8 characters is required!'
			),
	}),
	handleSubmit({ username, email, password }, { props }) {
		return props.register({ email, username, password });
	},
})(RegisterForm);

export default RegisterFormComp;
