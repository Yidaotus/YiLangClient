import { IDictionaryEntry, IDictionaryTag } from 'Document/Dictionary';
import { IExcerptedDocumentLink } from 'Document/Document';

export type DictionaryEntryField =
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

const ApiPaths = {
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
	documents: {
		path: 'documents',
		endpoints: {
			save: {
				path: '/',
				method: 'post',
			},
			list: {
				path: 'list',
				method: 'post',
			},
			remove: {
				path: '/',
				method: 'delete',
			},
			getById: {
				path: '/',
				method: 'get',
			},
		},
	},
	dictionary: {
		path: 'dictionary',
		endpoints: {
			tags: {
				path: 'tags',
				endpoints: {
					getAll: {
						path: '/',
						method: 'get',
					},
					add: {
						path: '/',
						method: 'post',
					},
				},
			},
			entries: {
				path: 'entries',
				endpoints: {
					add: {
						path: '/',
						method: 'post',
					},
					modify: {
						path: '/',
						method: 'patch',
					},
					delete: {
						path: '/',
						method: 'delete',
					},
					search: {
						path: 'search',
						method: 'get',
					},
					list: {
						path: 'list',
						method: 'post',
					},
					get: {
						path: '/:id',
						method: 'get',
					},
				},
			},
		},
	},
} as const;

export { ApiPaths };

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
	sortBy: DictionaryEntryField;
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

export interface IAddTagParams {
	lang: string;
	tag: Omit<IDictionaryTag, 'id' | 'lang'>;
}

export type IAddDictionaryEntryParams = Omit<IDictionaryEntry, 'id'>;

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
	id: string;
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
	ids: Array<string>;
}

export interface ISearchDictionaryParams {
	lang: string;
	key: string;
}

export interface ISetActiveLangParams {
	languageId: string;
}
