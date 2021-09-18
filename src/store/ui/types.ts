import { UUID } from 'Document/UUID';
import { StoreMutation } from 'store';

export interface IUIError {
	id: UUID;
	message: string;
	type: 'success' | 'info' | 'warning' | 'error';
}

export interface IUILoading {
	id: UUID;
	message: string;
}

export interface IUIState {
	loading: Array<IUILoading>;
	errors: Array<IUIError>;
}

export type UIMutations = UIMutation['type'];
type UIMutationType<T extends string, P = null> = StoreMutation<'UI', T, P>;

export type UIMutation =
	| UIMutationType<'PUSH_ERROR', { error: IUIError }>
	| UIMutationType<'PUSH_LOADING', { loading: IUILoading }>
	| UIMutationType<'POP_ERROR', { id: UUID }>
	| UIMutationType<'POP_LOADING', { id: UUID }>;
