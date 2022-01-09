import { IDictionaryTag } from 'Document/Dictionary';

import { DictionaryTagID } from 'Document/Utility';
import {
	IAddDictionaryTagParams,
	IApiResponse,
	ISearchTagParams,
} from './definitions/api';
import ApiService from './api.service';

const addTag = async (
	addParams: IAddDictionaryTagParams,
	language: string
): Promise<DictionaryTagID> => {
	const response = await ApiService.post<IApiResponse<string>>(
		`dictionary/${language}/tags`,
		addParams
	);
	return response.data.payload as DictionaryTagID;
};

const getTags = async (language: string): Promise<Array<IDictionaryTag>> => {
	const response = await ApiService.get<IApiResponse<Array<IDictionaryTag>>>(
		`dictionary/${language}/tags`
	);
	return response.data.payload as Array<IDictionaryTag>;
};

const getTag = async ({
	language,
	tagId,
}: {
	language: string;
	tagId: DictionaryTagID;
}): Promise<IDictionaryTag> => {
	const response = await ApiService.get<IApiResponse<IDictionaryTag>>(
		`dictionary/${language}/tags/${tagId}`
	);
	return response.data.payload as IDictionaryTag;
};

const searchTags = async (
	searchParams: ISearchTagParams
): Promise<Array<IDictionaryTag>> => {
	const response = await ApiService.post<IApiResponse<Array<IDictionaryTag>>>(
		`dictionary/${searchParams.lang}/tags/search`,
		searchParams
	);
	const entries = response.data.payload;
	return entries as Array<IDictionaryTag>;
};

export { getTags, addTag, searchTags, getTag };
