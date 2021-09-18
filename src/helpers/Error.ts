import { notification } from 'antd';

const handleError = (e: unknown): void => {
	let description = 'Unkown Error!';
	if (e instanceof Error) {
		description = e.message;
	}
	notification.open({
		message: 'Error',
		description,
		type: 'error',
	});
};

export default handleError;
