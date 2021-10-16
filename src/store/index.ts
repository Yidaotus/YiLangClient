import { applyMiddleware, createStore, combineReducers, Action } from 'redux';
import { createLogger } from 'redux-logger';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk, { ThunkAction, ThunkMiddleware } from 'redux-thunk';
import userState from './user/reducers';
import dictionaryState from './dictionary/reducers';
import uiState from './ui/reducers';
import { UserMutation } from './user/types';
import { DictionaryMutation } from './dictionary/types';
import { UIMutation } from './ui/types';

export type DirtyType = 'NEW' | 'UPDATED' | 'DELETED' | null;
export type DirtyObject<T> = T & { dirty: DirtyType };

export type IRootState = ReturnType<typeof rootReducer>;
export type IRootDispatch = typeof store.dispatch;
export type StoreMap<T> = Partial<{ [key: string]: T }>;
export type StoreAction<T extends Action, R> = ThunkAction<
	R,
	IRootState,
	unknown,
	T
>;
export type StoreMutation<S extends string, T extends string, P = null> = {
	type: `${S}_${T}`;
	payload: P;
};

const logger = createLogger();
const dev = process.env.NODE_ENV === 'development';
const thunkmw: ThunkMiddleware<
	IRootState,
	UserMutation | DictionaryMutation | UIMutation
> = thunk;

let middleware = dev
	? applyMiddleware(thunkmw, logger)
	: applyMiddleware(thunkmw);

if (dev) {
	const composeEnhancers = composeWithDevTools({
		latency: 10,
		maxAge: 10,
		trace: false,
		actionSanitizer: (action) =>
			action.type === 'EDITOR_SET_SELECTION' ||
			action.type === 'EDITOR_SET_STORED_POSSITION'
				? { ...action, data: '<<SELECTION>>' }
				: action,
		stateSanitizer: (state) => ({
			...state,
			'editor.storedPosition': null,
		}),
	});
	middleware = composeEnhancers(middleware);
}
const rootReducer = combineReducers({
	user: userState,
	dictionary: dictionaryState,
	ui: uiState,
});

const store = createStore(rootReducer, middleware);
export default store;
