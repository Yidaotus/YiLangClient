import { IDictionaryEntry } from 'Document/Dictionary';
import {
	IAddDictionaryEntryParams,
	IApiResponse,
	IDictionaryEntryFetchResponse,
	IListDictionaryParams,
	IListDictionaryResult,
	ISearchDictionaryParams,
} from './definitions/api';
import ApiService from './api.service';

const addDictionaryEntry = async (
	addParams: IAddDictionaryEntryParams
): Promise<string> => {
	const response = await ApiService.post<IApiResponse<string>>(
		`dictionary/entries`,
		addParams
	);
	return response.data.payload as string;
};

const getEntry = async ({
	id,
}: {
	id: string;
}): Promise<IDictionaryEntryFetchResponse> => {
	const response = await ApiService.get<
		IApiResponse<IDictionaryEntryFetchResponse>
	>(`dictionary/entries/${id}`);
	return response.data.payload as IDictionaryEntryFetchResponse;
};

const listDictionary = async (
	listParams: IListDictionaryParams
): Promise<IListDictionaryResult> => {
	const response = await ApiService.post<IApiResponse<IListDictionaryResult>>(
		'dictionary/entries/list',
		listParams
	);
	const list = response.data.payload;
	return list as IListDictionaryResult;
};

const searchDictionary = async (
	searchParams: ISearchDictionaryParams
): Promise<Array<IDictionaryEntry>> => {
	const response = await ApiService.post<
		IApiResponse<Array<IDictionaryEntry>>
	>(`dictionary/entries/search`, searchParams);
	const entries = response.data.payload;
	return entries as Array<IDictionaryEntry>;
};

export { listDictionary, addDictionaryEntry, getEntry, searchDictionary };
