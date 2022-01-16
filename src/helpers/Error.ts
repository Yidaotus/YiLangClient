import { IApiResponse } from 'api/definitions/api';
import { isApiResponse } from 'Document/Utility';
import { useSnackbar } from 'notistack';
import { useCallback } from 'react';

const useUiErrorHandler = () => {
	const { enqueueSnackbar } = useSnackbar();

	const handleError = useCallback(
		(e: unknown): void => {
			let description = 'Unknown Error!';
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
