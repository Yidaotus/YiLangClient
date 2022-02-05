import { IDictionaryEntry, IDictionarySentence } from 'Document/Dictionary';
import { DictionaryEntryID, DictionarySentenceID } from 'Document/Utility';
import {
	IAddDictionaryEntryParams,
	IAddDictionarySentenceParams,
	IApiResponse,
	ILinkSentenceWordParams,
	IListDictionaryParams,
	IListDictionaryResult,
	IListSentencesParams,
	IListSentencesResult,
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

const addDictionarySentence = async (
	addParams: IAddDictionarySentenceParams,
	language: string
): Promise<string> => {
	const response = await ApiService.post<IApiResponse<string>>(
		`dictionary/${language}/sentences`,
		addParams
	);
	return response.data.payload as DictionarySentenceID;
};

const unlinkSentenceWord = async (
	addParams: ILinkSentenceWordParams,
	language: string
): Promise<void> => {
	await ApiService.delete<IApiResponse<string>>(
		`dictionary/${language}/unlink`,
		{ data: addParams }
	);
};

const linkSentenceWord = async (
	addParams: ILinkSentenceWordParams,
	language: string
): Promise<void> => {
	await ApiService.post<IApiResponse<string>>(
		`dictionary/${language}/link`,
		addParams
	);
};

const addDictionaryEntry = async (
	addParams: IAddDictionaryEntryParams,
	language: string
): Promise<DictionaryEntryID> => {
	const response = await ApiService.post<IApiResponse<string>>(
		`dictionary/${language}/entries`,
		addParams
	);
	return response.data.payload as DictionaryEntryID;
};

const getSentence = async ({
	sentenceId,
	language,
}: {
	sentenceId: string;
	language: string;
}): Promise<IDictionarySentence> => {
	const response = await ApiService.get<IApiResponse<IDictionarySentence>>(
		`dictionary/${language}/sentences/${sentenceId}`
	);
	return response.data.payload as IDictionarySentence;
};

const getSentencesByWord = async ({
	wordId,
	language,
}: {
	wordId: string;
	language: string;
}): Promise<Array<IDictionarySentence>> => {
	const response = await ApiService.get<
		IApiResponse<Array<IDictionarySentence>>
	>(`dictionary/${language}/sentences/byWord/${wordId}`);
	return response.data.payload as Array<IDictionarySentence>;
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

const listSentences = async (
	listParams: IListSentencesParams
): Promise<IListSentencesResult> => {
	const response = await ApiService.post<IApiResponse<IListSentencesResult>>(
		`dictionary/${listParams.lang}/sentences/list`,
		listParams
	);
	const list = response.data.payload;
	return list as IListSentencesResult;
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
	listSentences,
	addDictionaryEntry,
	getEntry,
	searchDictionary,
	updateDictionaryEntry,
	deleteDictionaryEntry,
	addDictionarySentence,
	linkSentenceWord,
	unlinkSentenceWord,
	getSentencesByWord,
	getSentence,
};
