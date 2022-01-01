import axios from 'axios';
import API_URL from './config';

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

export default ApiService;
