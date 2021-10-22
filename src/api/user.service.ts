import { IConfig } from 'Document/Config';
import {
	ApiPaths,
	IApiResponse,
	ILoginResponseData,
	IRegisterParams,
	ILoginParams,
	IVerifyEmailParams,
	IUserResponseData,
	ISetActiveLangParams,
} from './definitions/api';
import ApiService from './api.service';

export enum Role {
	USER = 'USER',
	ADMIN = 'ADMIN',
}

const UserEndpoints = ApiPaths.user.endpoints;
const UserPath = (endpoint: string) => `${ApiPaths.user.path}/${endpoint}`;

const ConfigEndpoints = ApiPaths.config.endpoints;
const ConfigPath = (endpoint: string) => `${ApiPaths.config.path}/${endpoint}`;

const login = async (loginData: ILoginParams): Promise<ILoginResponseData> => {
	const { path } = UserEndpoints.login;
	const response = await ApiService.post<IApiResponse<ILoginResponseData>>(
		UserPath(path),
		loginData
	);
	return response.data.payload as ILoginResponseData;
};

const authorize = async (): Promise<IUserResponseData> => {
	const { path } = UserEndpoints.auth;
	const res = await ApiService.get<IApiResponse<IUserResponseData>>(
		UserPath(path)
	);
	return res.data.payload as IUserResponseData;
};

const register = async (userData: IRegisterParams): Promise<void> => {
	const { path } = UserEndpoints.register;
	await ApiService.post<IApiResponse<void>>(UserPath(path), userData);
};

const verify = async (tokenData: IVerifyEmailParams): Promise<void> => {
	const { path } = UserEndpoints.verify;
	await ApiService.post<IApiResponse<void>>(UserPath(path), tokenData);
};

const fetchConfig = async (): Promise<IConfig> => {
	const { path } = ConfigEndpoints.get;
	const res = await ApiService.get<IApiResponse<IConfig>>(ConfigPath(path));
	return res.data.payload as IConfig;
};

const saveConfig = async (config: IConfig): Promise<void> => {
	const { path } = ConfigEndpoints.set;
	await ApiService.post<IApiResponse<void>>(ConfigPath(path), config);
};

const updateActiveLanguage = async (
	langParams: ISetActiveLangParams
): Promise<void> => {
	const { path } = ConfigEndpoints.setActiveLanguage;
	await ApiService.post<IApiResponse<void>>(ConfigPath(path), langParams);
};

export {
	login,
	register,
	verify,
	authorize,
	fetchConfig,
	saveConfig,
	updateActiveLanguage,
};
