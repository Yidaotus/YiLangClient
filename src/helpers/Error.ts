import { notification } from 'antd';
import { IApiResponse } from 'api/definitions/api';

const isApiResponse = (e: unknown): e is IApiResponse<void> => {
	return (
		(e as IApiResponse<void>).status !== undefined &&
		(e as IApiResponse<void>).message !== undefined
	);
};

const handleError = (e: unknown): void => {
	let description = 'Unkown Error!';
	if (e instanceof Error) {
		description = e.message;
	} else if (isApiResponse(e)) {
		description = e.message;
	}
	notification.open({
		message: 'Error',
		description,
		type: 'error',
	});
};

export default handleError;
