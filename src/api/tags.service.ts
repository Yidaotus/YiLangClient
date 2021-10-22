import { IDictionaryTag } from 'Document/Dictionary';

import { ApiPaths, IAddTagParams, IApiResponse } from './definitions/api';
import ApiService from './api.service';

const TagsApi = ApiPaths.dictionary.endpoints.tags;
const TagsEndpoints = TagsApi.endpoints;
const TagsPath = (endpoint: string) => `${TagsApi.path}/${endpoint}`;

const addTag = async (addParams: IAddTagParams): Promise<string> => {
	const { path } = TagsEndpoints.add;
	const response = await ApiService.post<IApiResponse<string>>(
		TagsPath(path),
		addParams
	);
	return response.data.payload as string;
};

const getTags = async (language: string): Promise<Array<IDictionaryTag>> => {
	const { path } = TagsEndpoints.getAll;
	const response = await ApiService.get<IApiResponse<Array<IDictionaryTag>>>(`
		${TagsPath(path)}/${language}`);
	return response.data.payload as Array<IDictionaryTag>;
};

export { getTags, addTag };
