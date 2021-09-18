import { IDictionaryTag } from 'Document/Dictionary';

import { ApiPaths, IApiResponse, IGetManyTagsPrams } from './definitions/api';
import ApiService from './api.service';

const TagsEndpoints = ApiPaths.tags.endpoints;
const TagsPath = (endpoint: string) => `${ApiPaths.tags.path}/${endpoint}`;

const applyTagsDelta = async ({
	removedTags,
	updatedTags,
	addedTags,
}: {
	removedTags: Array<string>;
	updatedTags: Array<IDictionaryTag>;
	addedTags: Array<IDictionaryTag>;
}): Promise<void> => {
	const { path } = TagsEndpoints.applyDelta;
	await ApiService.post<IApiResponse<void>>(TagsPath(path), {
		removedTags,
		updatedTags,
		addedTags,
	});
};

const getTags = async (language: string): Promise<Array<IDictionaryTag>> => {
	const { path } = TagsEndpoints.getAll;
	const response = await ApiService.get<IApiResponse<Array<IDictionaryTag>>>(`
		${TagsPath(path)}/${language}`);
	return response.data.payload as Array<IDictionaryTag>;
};

const getMany = async (
	params: IGetManyTagsPrams
): Promise<Array<IDictionaryTag>> => {
	const { path } = TagsEndpoints.getMany;
	const response = await ApiService.post<IApiResponse<Array<IDictionaryTag>>>(
		TagsPath(path),
		params
	);
	return response.data.payload as Array<IDictionaryTag>;
};

export { applyTagsDelta, getTags, getMany };
