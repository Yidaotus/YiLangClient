import { Dispatch } from 'redux';
import { IRegisterParams, IVerifyEmailParams } from 'api/definitions/api';
import { StoreAction } from 'store';
import { fetchTags } from '@store/dictionary/actions';
import {
	IConfig,
	IDictionaryLookupSource,
	ILanguageConfig,
} from 'Document/Config';
import { getUUID, UUID } from 'Document/UUID';
import { LS_TOKEN_POINTER } from 'api/api.service';
import * as UserService from 'api/user.service';
import { UserMutation, Role } from './types';

type UserAction<R = void> = StoreAction<UserMutation, R>;

const register =
	(userDetails: IRegisterParams): UserAction =>
	async (): Promise<void> => {};

const verify =
	(tokenDetail: IVerifyEmailParams): UserAction =>
	async (): Promise<void> => {
		await UserService.verify(tokenDetail);
	};

const login =
	(userDetails: {
		email: string;
		password: string;
	}): UserAction<Promise<void>> =>
	async (dispatch): Promise<void> => {
		const { user, token } = await UserService.login(userDetails);
		localStorage.setItem(LS_TOKEN_POINTER, token);
		dispatch({
			type: 'USER_SETTOKEN',
			payload: token,
		});

		dispatch({
			type: 'USER_SETUSER',
			payload: {
				email: user.email,
				username: user.username,
				role: Role.USER,
			},
		});
	};

const logout = (): UserAction => () => {
	localStorage.setItem(LS_TOKEN_POINTER, '');
	/*
	dispatch({
		type: 'USER_SETTOKEN',
		payload: null,
	});
	dispatch({
		type: 'USER_SETUSER',
		payload: null,
	});
	*/
	window.location.reload();
};

const selectLanguage =
	(languageConfig: ILanguageConfig): UserAction<Promise<void>> =>
	async (dispatch) => {
		dispatch({
			type: 'USER_SETTINGS_SELECT_LANGUAGE',
			payload: { languageConfig },
		});
		await UserService.updateActiveLanguage({
			languageId: languageConfig.key,
		});
	};

const addLanguageLUSource =
	({
		langKey,
		source,
	}: {
		langKey: UUID;
		source: IDictionaryLookupSource;
	}): UserAction =>
	(dispatch) => {
		dispatch({
			type: 'USER_SETTINGS_ADD_LANGUAGE_LU_SOURCE',
			payload: { langKey, source },
		});
	};

const addLanguageConfig =
	(languageConfig: ILanguageConfig): UserAction =>
	(dispatch, getState) => {
		const key = getUUID();
		const sources =
			languageConfig.lookupSources?.map((lus, index) => ({
				...lus,
				priority: index,
			})) || [];
		const newLangConnf = {
			...languageConfig,
			lookupSources: sources,
			key,
			default: false,
		};
		dispatch({
			type: 'USER_SETTINGS_ADD_LANGUAGE',
			payload: { languageConfig: newLangConnf },
		});
		UserService.saveConfig(getState().user.config);
	};

const removeLanguageConfig =
	(key: UUID): UserAction =>
	(dispatch, getState) => {
		dispatch({
			type: 'USER_SETTINGS_REMOVE_LANGUAGE',
			payload: { key },
		});
		UserService.saveConfig(getState().user.config);
	};

const updateLanguageConfig =
	(languageConfig: ILanguageConfig): UserAction =>
	(dispatch, getState) => {
		const sources =
			languageConfig.lookupSources?.map((lus, index) => ({
				...lus,
				priority: index,
			})) || [];
		const newLangConnf = {
			...languageConfig,
			lookupSources: sources,
			default: false,
		};
		dispatch({
			type: 'USER_SETTINGS_UPDATE_LANGUAGE',
			payload: { languageConfig: newLangConnf },
		});
		UserService.saveConfig(getState().user.config);
	};

const initialize = (): UserAction<Promise<void>> => async (dispatch) => {
	const config: IConfig = await UserService.fetchConfig();
	if (config) {
		dispatch({ type: 'USER_SET_CONFIG', payload: config });

		const initLangConf = config.languageConfigs.find(
			(langConf) => langConf.key === config.activeLanguage
		);
		if (initLangConf) {
			await dispatch(fetchTags(initLangConf.key));
		}
	}
};

export {
	register,
	login,
	verify,
	logout,
	selectLanguage,
	addLanguageConfig,
	addLanguageLUSource,
	updateLanguageConfig,
	removeLanguageConfig,
	initialize,
};
