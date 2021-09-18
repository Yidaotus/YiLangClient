import {
	IConfig,
	IDictionaryLookupSource,
	ILanguageConfig,
} from 'Document/Config';
import { UUID } from 'Document/UUID';
import { StoreMutation } from 'store';

export enum Role {
	USER = 'USER',
	ADMIN = 'ADMIN',
}

export interface IUser {
	username: string;
	email: string;
	role: Role;
}

export interface IEditorSettings {
	showSpellingDefault: boolean;
}

export interface IUserState {
	user: IUser | null;
	jwt: string | null;
	errors: string[];
	config: IConfig;
	editorSettings: IEditorSettings;
}

type UserMutationType<T extends string, P = null> = StoreMutation<'USER', T, P>;

export type UserMutation =
	| UserMutationType<'PUSHERROR', string>
	| UserMutationType<'SETUSER', IUser | null>
	| UserMutationType<'SETTOKEN', string | null>
	| UserMutationType<'SET_CONFIG', IConfig>
	| UserMutationType<
			'SETTINGS_ADD_LANGUAGE_LU_SOURCE',
			{ langKey: UUID; source: IDictionaryLookupSource }
	  >
	| UserMutationType<
			'SETTINGS_UPDATE_LANGUAGE',
			{ languageConfig: ILanguageConfig }
	  >
	| UserMutationType<
			'SETTINGS_ADD_LANGUAGE',
			{ languageConfig: ILanguageConfig }
	  >
	| UserMutationType<'SETTINGS_REMOVE_LANGUAGE', { key: UUID }>
	| UserMutationType<
			'SETTINGS_SELECT_LANGUAGE',
			{ languageConfig: ILanguageConfig }
	  >
	| UserMutationType<'CLEARERRORS', void>;
