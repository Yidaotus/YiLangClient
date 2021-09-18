/* eslint-disable no-param-reassign */
import { ensureNever } from 'Document/Utility';
import produce from 'immer';
import { UserMutation, IUserState } from './types';

const initialState: IUserState = {
	user: null,
	jwt: '',
	errors: new Array<string>(),
	editorSettings: {
		showSpellingDefault: true,
	},
	config: {
		languageConfigs: [],
		activeLanguage: null,
	},
};

export default (state = initialState, action: UserMutation): IUserState =>
	produce(state, (draft: IUserState) => {
		switch (action.type) {
			case 'USER_SETUSER': {
				draft.user = action.payload;
				break;
			}
			case 'USER_SETTOKEN': {
				draft.jwt = action.payload;
				break;
			}
			case 'USER_PUSHERROR': {
				draft.errors.push(action.payload);
				break;
			}
			case 'USER_CLEARERRORS': {
				draft.errors = new Array<string>();
				break;
			}
			case 'USER_SET_CONFIG': {
				draft.config = action.payload;
				break;
			}
			case 'USER_SETTINGS_SELECT_LANGUAGE': {
				const { languageConfig } = action.payload;
				draft.config.activeLanguage = languageConfig.key;
				break;
			}
			case 'USER_SETTINGS_ADD_LANGUAGE': {
				const { languageConfig } = action.payload;
				draft.config.languageConfigs.push(languageConfig);
				break;
			}
			case 'USER_SETTINGS_REMOVE_LANGUAGE': {
				const { key } = action.payload;
				const configIndex = draft.config.languageConfigs.findIndex(
					(lang) => lang.key === key
				);
				if (configIndex > -1) {
					draft.config.languageConfigs.splice(configIndex, 1);
				}
				break;
			}
			case 'USER_SETTINGS_UPDATE_LANGUAGE': {
				const { languageConfig } = action.payload;
				const configIndex = draft.config.languageConfigs.findIndex(
					(lang) => lang.key === languageConfig.key
				);
				if (configIndex > -1) {
					draft.config.languageConfigs.splice(
						configIndex,
						1,
						languageConfig
					);
				}
				break;
			}
			case 'USER_SETTINGS_ADD_LANGUAGE_LU_SOURCE': {
				const { langKey, source } = action.payload;
				const langConfig = draft.config.languageConfigs.find(
					(langConf) => langConf.key === langKey
				);
				if (langConfig) {
					langConfig.lookupSources.push(source);
				}
				break;
			}
			default: {
				const { type } = action;
				ensureNever(type);
				return state;
			}
		}
		return draft;
	});
