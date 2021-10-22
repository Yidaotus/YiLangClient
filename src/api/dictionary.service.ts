import { IDictionaryEntry } from 'Document/Dictionary';
import {
	ApiPaths,
	IAddDictionaryEntryParams,
	IApiResponse,
	IDictionaryEntryFetchResponse,
	IListDictionaryParams,
	IListDictionaryResult,
	ISearchDictionaryParams,
} from './definitions/api';
import ApiService from './api.service';

const DictionaryEntryAPI = ApiPaths.dictionary.endpoints.entries;
const DictionaryEntryEndpoints = DictionaryEntryAPI.endpoints;
const DictionaryEntryPath = (endpoint: string) =>
	`${DictionaryEntryAPI.path}/${endpoint}`;

const addDictionaryEntry = async (
	addParams: IAddDictionaryEntryParams
): Promise<string> => {
	const { path } = DictionaryEntryEndpoints.add;
	const response = await ApiService.post<IApiResponse<string>>(
		DictionaryEntryPath(path),
		addParams
	);
	return response.data.payload as string;
};

const getEntry = async ({
	id,
	language,
}: {
	id: string;
	language: string;
}): Promise<IDictionaryEntryFetchResponse> => {
	const { path } = DictionaryEntryEndpoints.get;
	const response = await ApiService.get<
		IApiResponse<IDictionaryEntryFetchResponse>
	>(`
		${DictionaryEntryPath(path)}/${language}/${id}`);
	return response.data.payload as IDictionaryEntryFetchResponse;
};

const listDictionary = async (
	listParams: IListDictionaryParams
): Promise<IListDictionaryResult> => {
	const { path } = DictionaryEntryEndpoints.list;
	const response = await ApiService.post<IApiResponse<IListDictionaryResult>>(
		DictionaryEntryPath(path),
		listParams
	);
	const list = response.data.payload;
	return list as IListDictionaryResult;
};

const searchDictionary = async (
	searchParams: ISearchDictionaryParams
): Promise<Array<IDictionaryEntry>> => {
	const { path } = DictionaryEntryEndpoints.search;
	const { lang, key } = searchParams;
	const response = await ApiService.get<
		IApiResponse<Array<IDictionaryEntry>>
	>(`${DictionaryEntryPath(path)}/${lang}/${key}`);
	const entries = response.data.payload;
	return entries as Array<IDictionaryEntry>;
};

export { listDictionary, addDictionaryEntry, getEntry, searchDictionary };
