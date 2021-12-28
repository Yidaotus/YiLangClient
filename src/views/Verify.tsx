import React, { FC, useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';

export interface IRegisterData {
	email: string;
	username: string;
	password: string;
}

export interface ILoginData {
	email: string;
	password: string;
}

const VerifyView: FC = () => {
	const { code } = useParams<{ code: string }>();
	const [errors, setErrors] = useState<string[]>(new Array<string>());
	const dispatch = useDispatch();
	const navigate = useNavigate();

	useEffect(() => {
		const verifyCB = async () => {
			setErrors([]);
			// @TODO Verify
			// await dispatch(verifyDispatcher({ token: code }));
			navigate('/login');
		};

		verifyCB();
	}, [code, dispatch, navigate]);

	return (
		<div className="rounded-t-lg overflow-hidden border-t border-l border-r border-gray-400 flex justify-center p-8">
			{errors.length > 0 && (
				<div className="flex justify-center pt-4">
					<span className="text-md text-red-600">
						{errors.map((err) => (
							<p key={err}>{err}</p>
						))}
					</span>
				</div>
			)}
		</div>
	);
};

export default VerifyView;
