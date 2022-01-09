import { IConfig, IEditorConfig, ILanguageConfig } from 'Document/Config';
import { IApiResponse, ISetActiveLangParams } from './definitions/api';
import ApiService from './api.service';

const fetchConfig = async (): Promise<IConfig> => {
	const res = await ApiService.get<IApiResponse<IConfig>>('config');
	return res.data.payload as IConfig;
};

const saveConfig = async (config: Omit<IConfig, 'id'>): Promise<void> => {
	await ApiService.post<IApiResponse<void>>('config', config);
};

const setActiveLanguage = async (
	langParams: ISetActiveLangParams
): Promise<void> => {
	await ApiService.post<IApiResponse<void>>(
		'config/activeLanguage',
		langParams
	);
};

const addLanguageConfig = async (
	languageConfig: Omit<ILanguageConfig, 'id'>
): Promise<string> => {
	const response = await ApiService.post<IApiResponse<string>>(
		'config/language',
		languageConfig
	);
	return response.data.payload as string;
};

const updateEditorConfig = async ({
	editorConfig,
}: {
	editorConfig: Partial<IEditorConfig>;
}): Promise<void> => {
	await ApiService.post<IApiResponse<void>>('config/editor/', editorConfig);
};

const updateLanguageConfig = async ({
	id,
	languageConfig,
}: {
	id: string;
	languageConfig: Omit<ILanguageConfig, 'id'>;
}): Promise<void> => {
	await ApiService.post<IApiResponse<void>>(
		`config/language/${id}`,
		languageConfig
	);
};

const removeLanguageConfig = async (id: string): Promise<void> => {
	await ApiService.delete<IApiResponse<void>>(`config/language/${id}`);
};

export {
	fetchConfig,
	saveConfig,
	setActiveLanguage,
	addLanguageConfig,
	removeLanguageConfig,
	updateLanguageConfig,
	updateEditorConfig,
};
