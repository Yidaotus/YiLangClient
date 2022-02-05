import {
	IDictionaryEntry,
	IDictionarySentence,
	IDictionaryTag,
} from 'Document/Dictionary';
import { IExcerptedDocumentLink } from 'Document/Document';
import { DictionaryTagID } from 'Document/Utility';

export type DictionaryEntryField =
	| 'word'
	| 'translation'
	| 'createdAt'
	| 'updatedAt';

export const ApiStatuses = {
	OK: 1,
	UNAUTHENTICATED: 2,
	UNAUTHORIZED: 3,
	INVALIDARGUMENT: 4,
	ERROR: 5,
} as const;
export type ApiStatus = typeof ApiStatuses[keyof typeof ApiStatuses];

export type ApiMethod = 'post' | 'put' | 'patch' | 'get' | 'delete';

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

export type IAddDictionaryTagParams = Omit<IDictionaryTag, 'id'>;
export type IAddDictionaryEntryParams = Omit<
	IDictionaryEntry,
	'id' | 'lang' | 'createdAt'
>;
export type IAddDictionarySentenceParams = Omit<
	IDictionarySentence,
	'id' | 'lang'
>;

export type ILinkSentenceWordParams = {
	wordId: string;
	sentenceId: string;
};

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
	searchTerm?: string;
	tagFilter?: Array<DictionaryTagID>;
}

export interface IGetManyTagsPrams {
	lang: string;
	ids: Array<string>;
}

export interface ISearchTagParams {
	lang: string;
	key: string;
}

export interface ISearchDictionaryParams {
	lang: string;
	key: string;
}

export interface ISetActiveLangParams {
	languageId: string;
}
