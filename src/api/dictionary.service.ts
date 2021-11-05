import { IDictionaryEntry } from 'Document/Dictionary';
import {
	IAddDictionaryEntryParams,
	IApiResponse,
	IListDictionaryParams,
	IListDictionaryResult,
	ISearchDictionaryParams,
} from './definitions/api';
import ApiService from './api.service';

const deleteDictionaryEntry = async (
	id: string,
	language: string
): Promise<void> => {
	await ApiService.delete<IApiResponse<void>>(
		`dictionary/${language}/entries/${id}`
	);
};

const updateDictionaryEntry = async (
	entryToUpdate: IDictionaryEntry,
	language: string
): Promise<void> => {
	await ApiService.post<IApiResponse<void>>(
		`dictionary/${language}/entries/${entryToUpdate.id}`,
		entryToUpdate
	);
};

const addDictionaryEntry = async (
	addParams: IAddDictionaryEntryParams,
	language: string
): Promise<string> => {
	const response = await ApiService.post<IApiResponse<string>>(
		`dictionary/${language}/entries`,
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
}): Promise<IDictionaryEntry> => {
	const response = await ApiService.get<IApiResponse<IDictionaryEntry>>(
		`dictionary/${language}/entries/${id}`
	);
	return response.data.payload as IDictionaryEntry;
};

const listDictionary = async (
	listParams: IListDictionaryParams
): Promise<IListDictionaryResult> => {
	const response = await ApiService.post<IApiResponse<IListDictionaryResult>>(
		`dictionary/${listParams.lang}/entries/list`,
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
	>(`dictionary/${searchParams.lang}/entries/search`, searchParams);
	const entries = response.data.payload;
	return entries as Array<IDictionaryEntry>;
};

export {
	listDictionary,
	addDictionaryEntry,
	getEntry,
	searchDictionary,
	updateDictionaryEntry,
	deleteDictionaryEntry,
};
