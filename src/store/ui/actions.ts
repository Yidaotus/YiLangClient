import { UUID } from 'Document/UUID';
import { StoreAction } from 'store';
import { IUIError, IUILoading, UIMutation } from './types';

type UIAction<R = void> = StoreAction<UIMutation, R>;

const pushError =
	(error: IUIError): UIAction =>
	(dispatch) => {
		dispatch({
			type: 'UI_PUSH_ERROR',
			payload: { error },
		});
	};

const popError =
	(id: UUID): UIAction =>
	(dispatch) => {
		dispatch({
			type: 'UI_POP_ERROR',
			payload: { id },
		});
	};

const pushLoading =
	(loading: IUILoading): UIAction =>
	(dispatch) => {
		dispatch({
			type: 'UI_PUSH_LOADING',
			payload: { loading },
		});
	};

const popLoading =
	(id: UUID): UIAction =>
	(dispatch) => {
		dispatch({
			type: 'UI_POP_LOADING',
			payload: { id },
		});
	};
export { pushError, popError, pushLoading, popLoading };
