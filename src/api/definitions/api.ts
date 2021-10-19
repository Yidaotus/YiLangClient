import { IDictionaryEntry } from 'Document/Dictionary';
import { IExcerptedDocumentLink } from 'Document/Document';
import { UUID } from 'Document/UUID';

export type DictionaryEntryFields =
	| 'word'
	| 'translation'
	| 'createdAt'
	| 'updatedAt';

export const ApiStatuses = {
	OK: 1,
	UNAUTHANTICATED: 2,
	UNAUTHORIZED: 3,
	INVALIDARGUMENT: 4,
	ERROR: 5,
} as const;
export type ApiStatus = typeof ApiStatuses[keyof typeof ApiStatuses];

export type ApiMethod = 'post' | 'put' | 'patch' | 'get' | 'delete';

interface IApiEndpoint {
	path: string;
	method: ApiMethod;
}

interface IApiPath {
	path: string;
	endpoints: {
		[index: string]: IApiEndpoint;
	};
}

interface IApiPaths {
	[index: string]: IApiPath;
}

const ApiPaths: IApiPaths = {
	user: {
		path: 'user',
		endpoints: {
			login: {
				path: 'login',
				method: 'post',
			},
			register: {
				path: 'register',
				method: 'post',
			},
			auth: {
				path: 'auth',
				method: 'get',
			},
			verify: {
				path: 'verify',
				method: 'post',
			},
		},
	},
	config: {
		path: 'config',
		endpoints: {
			get: {
				method: 'get',
				path: '',
			},
			set: {
				method: 'post',
				path: '',
			},
			setActiveLanguage: {
				method: 'post',
				path: '/activeLanguage',
			},
		},
	},
	document: {
		path: 'document',
		endpoints: {
			save: {
				path: 'entries',
				method: 'post',
			},
			list: {
				path: 'entries/list',
				method: 'post',
			},
			remove: {
				path: 'entries',
				method: 'delete',
			},
			getById: {
				path: 'entries',
				method: 'get',
			},
		},
	},
	tags: {
		path: 'tags',
		endpoints: {
			getMany: {
				path: 'retrieve',
				method: 'post',
			},
			getAll: {
				path: 'entries',
				method: 'get',
			},
			applyDelta: {
				path: 'delta',
				method: 'post',
			},
		},
	},
	dict: {
		path: 'dict',
		endpoints: {
			getMany: {
				path: 'retrieve',
				method: 'post',
			},
			add: {
				path: 'entries',
				method: 'post',
			},
			applyDelta: {
				path: 'delta',
				method: 'post',
			},
			list: {
				path: 'list',
				method: 'post',
			},
			modify: {
				path: 'entry',
				method: 'patch',
			},
			delete: {
				path: 'entry',
				method: 'delete',
			},
			search: {
				path: 'search',
				method: 'get',
			},
			get: {
				path: 'entry',
				method: 'get',
			},
			getAll: {
				path: 'entries',
				method: 'get',
			},
			analyze: {
				path: 'analyze',
				method: 'post',
			},
		},
	},
};

export { ApiPaths };

export enum ApiPathString {
	LOGIN = 'user/login',
	REGISTER = 'user/register',
	AUTH = 'user/auth',
}

export interface IRegisterParams {
	username: string;
	email: string;
	password: string;
}

export interface IVerifyEmailParams {
	token: string;
}

export interface ILoginParams {
	email: string;
	password: string;
}

export interface IUserResponseData {
	id?: number;
	email: string;
	username: string;
}

export interface ILoginResponseData {
	user: IUserResponseData;
	token: string;
}

export interface IUserData {
	id: string;
}

export interface ITokenData {
	user: IUserData;
}

export interface IApiResponse<T> {
	status: ApiStatus;
	message: string;
	payload?: T;
}

export interface IDictionaryEntryParams {
	word: string;
	translation: string;
	lang: string;
}

export interface IFragementData {
	position: number;
	entries: IDictionaryEntryData[];
}

export interface IDictionaryEntryData {
	word: string;
	translation: string;
	lang: string;
}

export interface IDictionaryFetchParams {
	sortBy: DictionaryEntryFields;
	lang: string;
	limit: number;
	skip: number;
}

export interface IDictionaryEntryFetchResponse {
	entry: IDictionaryEntry;
	linkExcerpt: string;
	rootEntry?: IDictionaryEntry;
	subEntries: Array<IDictionaryEntry>;
	otherExcerpts?: Array<IExcerptedDocumentLink>;
}

export interface IDocumentParam {
	document: string;
	lang: string;
}

export interface IListDocumentsParams {
	sortBy: 'title' | 'createdAt';
	skip: number;
	limit: number;
	excerptLength: number;
	lang: string;
}

export interface IGetManyDictEntriesPrams {
	lang: string;
	ids: Array<string>;
}

export interface IDocumentExcerpt {
	id: UUID;
	title: string;
	excerpt: string;
	createdAt: Date;
	updatedAt: Date;
}
export interface IListDocumentResult {
	total: number;
	excerpts: Array<IDocumentExcerpt>;
}

export interface IListDictionaryResult {
	total: number;
	entries: Array<IDictionaryEntry>;
}
export interface IListDictionaryParams {
	sortBy?: {
		key: string;
		order: 'ascend' | 'descend';
	};
	filter?: {
		[key in keyof Pick<
			IDictionaryEntry,
			'comment' | 'key' | 'spelling' | 'translations'
		>]?: Array<string> | null;
	};
	skip: number;
	limit: number;
	excerptLength: number;
	lang: string;
}

export interface IGetManyTagsPrams {
	lang: string;
	ids: Array<UUID>;
}

export interface ISearchDictionaryParams {
	lang: string;
	key: string;
}

export interface ISetActiveLangParams {
	languageId: UUID;
}
