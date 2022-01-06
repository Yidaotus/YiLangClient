import { IApiResponse } from 'api/definitions/api';
import { useSnackbar } from 'notistack';
import { useCallback } from 'react';

const isApiResponse = (e: unknown): e is IApiResponse<void> => {
	return (
		(e as IApiResponse<void>).status !== undefined &&
		(e as IApiResponse<void>).message !== undefined
	);
};

const useUiErrorHandler = () => {
	const { enqueueSnackbar } = useSnackbar();

	const handleError = useCallback(
		(e: unknown): void => {
			let description = 'Unkown Error!';
			if (e instanceof Error) {
				description = e.message;
			} else if (isApiResponse(e)) {
				description = e.message;
			}
			enqueueSnackbar(description, { variant: 'error' });
		},
		[enqueueSnackbar]
	);

	return handleError;
};

export default useUiErrorHandler;
