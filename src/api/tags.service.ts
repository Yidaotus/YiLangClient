import { IDictionaryTag } from 'Document/Dictionary';

import { IAddDictionaryTagParams, IApiResponse } from './definitions/api';
import ApiService from './api.service';

const addTag = async (addParams: IAddDictionaryTagParams): Promise<string> => {
	const response = await ApiService.post<IApiResponse<string>>(
		'dictionary/tags',
		addParams
	);
	return response.data.payload as string;
};

const getTags = async (language: string): Promise<Array<IDictionaryTag>> => {
	const response = await ApiService.get<IApiResponse<Array<IDictionaryTag>>>(
		`dictionary/tags/byLanguage/${language}`
	);
	return response.data.payload as Array<IDictionaryTag>;
};

export { getTags, addTag };
