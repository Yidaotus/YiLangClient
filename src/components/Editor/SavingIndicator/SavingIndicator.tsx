import './SavingIndicator.css';
import { useEffect, useState } from 'react';
import { SnackbarKey, useSnackbar } from 'notistack';
import usePrevious from '@hooks/usePreviousState';

export type SavingState = 'LOADING' | 'SUCCESS' | 'ERROR' | 'IDLE';

const useSavingIndicator = (savingState: SavingState) => {
	const [currentSnackKey, setCurrentSnackKey] = useState<SnackbarKey>();
	const { enqueueSnackbar, closeSnackbar } = useSnackbar();
	const previousState = usePrevious(savingState);

	const stateSwitched = previousState !== savingState;

	useEffect(() => {
		if (currentSnackKey && stateSwitched) {
			closeSnackbar(currentSnackKey);
		}
	}, [closeSnackbar, currentSnackKey, previousState, stateSwitched]);

	useEffect(() => {
		switch (savingState) {
			case 'LOADING':
				setCurrentSnackKey(
					enqueueSnackbar('Saving document...', {
						variant: 'info',
					})
				);
				break;
			case 'ERROR':
				setCurrentSnackKey(
					enqueueSnackbar(
						'Something went wrong while trying to save the Document',
						{
							variant: 'error',
						}
					)
				);
				break;
			case 'SUCCESS':
				setCurrentSnackKey(
					enqueueSnackbar('Document saved successfully', {
						variant: 'success',
					})
				);
				break;
			default:
				break;
		}
	}, [closeSnackbar, enqueueSnackbar, savingState]);
};

export default useSavingIndicator;
