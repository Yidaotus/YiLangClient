import axios, { AxiosError } from 'axios';
import { logout } from 'store/user/actions';
import API_URL from './config';
import { IApiResponse, ApiStatuses } from './definitions/api';
import store from '../store';

const debug = true;
export const LS_TOKEN_POINTER = 'token' as const;

const ApiService = axios.create({
	baseURL: API_URL,
	timeout: debug ? 0 : 5000,
	withCredentials: true,
});

ApiService.interceptors.request.use((request) => {
	const token = localStorage.getItem(LS_TOKEN_POINTER);
	request.headers['X-Auth-Token'] = token;
	return request;
});

ApiService.interceptors.response.use(
	(response) => {
		return response;
	},
	async (error) => {
		if ((error.response || {}).data) {
			const { data } = error.response;
			// FIXME expect in try catch to recieve apiresponse error
			const { status, message } = data as IApiResponse<void>;
			switch (status) {
				case ApiStatuses.UNAUTHANTICATED:
				case ApiStatuses.UNAUTHORIZED: {
					break;
				}
				default:
					break;
			}
			const axiosError = error as AxiosError<IApiResponse<void>>;
			axiosError.message = message;
			return Promise.reject(data);
		}
		if (!error.status) {
			return Promise.reject(new Error('Server unavailiable'));
		}
		// throw new Error('Invalid ApiResponce Object so Fatal!');
		return Promise.reject();
	}
);

export default ApiService;
