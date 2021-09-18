import { ensureNever } from 'Document/Utility';
import { UIMutation, IUIState, IUILoading, IUIError } from './types';

const initialState: IUIState = {
	loading: new Array<IUILoading>(),
	errors: new Array<IUIError>(),
};

export default (state = initialState, action: UIMutation): IUIState => {
	switch (action.type) {
		case 'UI_PUSH_LOADING': {
			const { loading } = action.payload;
			return {
				...state,
				loading: [...state.loading, loading],
			};
		}
		case 'UI_POP_LOADING': {
			const { id } = action.payload;
			return {
				...state,
				loading: state.loading.filter((l) => l.id !== id),
			};
		}
		case 'UI_PUSH_ERROR': {
			const { error } = action.payload;
			return {
				...state,
				errors: [...state.errors, error],
			};
		}
		case 'UI_POP_ERROR': {
			const { id } = action.payload;
			return {
				...state,
				errors: state.errors.filter((e) => e.id !== id),
			};
		}
		default: {
			const { type } = action;
			ensureNever(type);
			return state;
		}
	}
};
