import { IDictionaryTag } from 'Document/Dictionary';

import { IAddDictionaryTagParams, IApiResponse } from './definitions/api';
import ApiService from './api.service';

const addTag = async (
	addParams: IAddDictionaryTagParams,
	language: string
): Promise<string> => {
	const response = await ApiService.post<IApiResponse<string>>(
		`dictionary/${language}/tags`,
		addParams
	);
	return response.data.payload as string;
};

const getTags = async (language: string): Promise<Array<IDictionaryTag>> => {
	const response = await ApiService.get<IApiResponse<Array<IDictionaryTag>>>(
		`dictionary/${language}/tags`
	);
	return response.data.payload as Array<IDictionaryTag>;
};

export { getTags, addTag };
