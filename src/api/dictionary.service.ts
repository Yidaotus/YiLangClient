import { IDictionaryEntry } from 'Document/Dictionary';

import {
	ApiPaths,
	IApiResponse,
	IDictionaryEntryFetchResponse,
	IDocumentParam,
	IFragementData,
	IGetManyDictEntriesPrams,
	IListDictionaryParams,
	IListDictionaryResult,
	ISearchDictionaryParams,
} from './definitions/api';
import ApiService from './api.service';

const DictionaryEndpoints = ApiPaths.dict.endpoints;
const DictionaryPath = (endpoint: string) =>
	`${ApiPaths.dict.path}/${endpoint}`;

const analyze = async (
	analyzeParams: IDocumentParam
): Promise<IFragementData[]> => {
	const { path } = DictionaryEndpoints.analyze;
	const response = await ApiService.post<IApiResponse<IFragementData[]>>(
		DictionaryPath(path),
		analyzeParams
	);
	return response.data.payload as IFragementData[];
};

const applyDictionaryDelta = async ({
	removedEntries,
	updatedEntries,
	addedEntries,
}: {
	removedEntries: Array<string>;
	updatedEntries: Array<Partial<IDictionaryEntry>>;
	addedEntries: Array<IDictionaryEntry>;
}): Promise<void> => {
	const { path } = DictionaryEndpoints.applyDelta;
	await ApiService.post<IApiResponse<void>>(DictionaryPath(path), {
		removedEntries,
		updatedEntries,
		addedEntries,
	});
};

const addDictionaryEntries = async (
	entries: IDictionaryEntry[]
): Promise<void> => {
	const { path } = DictionaryEndpoints.add;
	await ApiService.post<IApiResponse<void>>(DictionaryPath(path), entries);
};

const getDictionary = async (
	language: string
): Promise<Array<IDictionaryEntry>> => {
	const { path } = DictionaryEndpoints.getAll;
	const response = await ApiService.get<
		IApiResponse<Array<IDictionaryEntry>>
	>(`
		${DictionaryPath(path)}/${language}`);
	return response.data.payload as Array<IDictionaryEntry>;
};

const getEntry = async ({
	id,
	language,
}: {
	id: string;
	language: string;
}): Promise<IDictionaryEntryFetchResponse> => {
	const { path } = DictionaryEndpoints.get;
	const response = await ApiService.get<
		IApiResponse<IDictionaryEntryFetchResponse>
	>(`
		${DictionaryPath(path)}/${language}/${id}`);
	return response.data.payload as IDictionaryEntryFetchResponse;
};

const getEntries = async ({
	ids,
	lang,
}: IGetManyDictEntriesPrams): Promise<Array<IDictionaryEntry>> => {
	const { path } = DictionaryEndpoints.getMany;
	const response = await ApiService.post<
		IApiResponse<Array<IDictionaryEntry>>
	>(DictionaryPath(path), { ids, lang });
	return response.data.payload as Array<IDictionaryEntry>;
};

const listDictionary = async (
	listParams: IListDictionaryParams
): Promise<IListDictionaryResult> => {
	const { path } = DictionaryEndpoints.list;
	const response = await ApiService.post<IApiResponse<IListDictionaryResult>>(
		DictionaryPath(path),
		listParams
	);
	const list = response.data.payload;
	return list as IListDictionaryResult;
};

const searchDictionary = async (
	searchParams: ISearchDictionaryParams
): Promise<Array<IDictionaryEntry>> => {
	const { path } = DictionaryEndpoints.search;
	const { lang, key } = searchParams;
	const response = await ApiService.get<
		IApiResponse<Array<IDictionaryEntry>>
	>(`${DictionaryPath(path)}/${lang}/${key}`);
	const entries = response.data.payload;
	return entries as Array<IDictionaryEntry>;
};

export {
	analyze,
	listDictionary,
	applyDictionaryDelta,
	getDictionary,
	addDictionaryEntries,
	getEntry,
	searchDictionary,
	getEntries,
};
