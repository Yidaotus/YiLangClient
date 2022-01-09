import {
	IApiResponse,
	ILoginResponseData,
	IRegisterParams,
	ILoginParams,
	IVerifyEmailParams,
	IUserResponseData,
} from './definitions/api';
import ApiService from './api.service';

export enum Role {
	USER = 'USER',
	ADMIN = 'ADMIN',
}

const login = async (loginData: ILoginParams): Promise<ILoginResponseData> => {
	const response = await ApiService.post<IApiResponse<ILoginResponseData>>(
		'user/login',
		loginData
	);
	return response.data.payload as ILoginResponseData;
};

const authorize = async (): Promise<IUserResponseData> => {
	const res = await ApiService.get<IApiResponse<IUserResponseData>>(
		'user/auth'
	);
	return res.data.payload as IUserResponseData;
};

const register = async (userData: IRegisterParams): Promise<void> => {
	await ApiService.post<IApiResponse<void>>('user/register', userData);
};

const verify = async (tokenData: IVerifyEmailParams): Promise<void> => {
	await ApiService.post<IApiResponse<void>>('user/verify', tokenData);
};

export { login, register, verify, authorize };
