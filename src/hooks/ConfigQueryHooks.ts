import handleError from '@helpers/Error';
import {
	removeLanguageConfig,
	addLanguageConfig,
	updateLanguageConfig,
	updateEditorConfig,
	fetchConfig,
	saveConfig,
	setActiveLanguage,
} from 'api/config.service.';
import { IApiResponse } from 'api/definitions/api';
import {
	IConfig,
	IDictionaryLookupSource,
	IEditorConfig,
	ILanguageConfig,
} from 'Document/Config';
import { useMutation, useQuery, useQueryClient } from 'react-query';

const useUserConfig = (): IConfig | null => {
	const { data } = useQuery(['userConfig'], fetchConfig, {
		refetchOnWindowFocus: false,
	});

	return data || null;
};

const useLanguageConfigs = (): Array<ILanguageConfig> => {
	const userConfig = useUserConfig();
	return userConfig?.languageConfigs || [];
};

const useEditorConfig = (): IEditorConfig | null => {
	const userConfig = useUserConfig();
	return userConfig?.editorConfig || null;
};

const useActiveLanguageConf = (): ILanguageConfig | null => {
	const userConfig = useUserConfig();
	let activeConfig: ILanguageConfig | null = null;
	if (userConfig) {
		activeConfig =
			userConfig.languageConfigs.find(
				(langConf) => langConf.id === userConfig.activeLanguage
			) || null;
	}

	return activeConfig || null;
};

const useLookupSources = () => {
	const activeLanguage = useActiveLanguageConf();
	let lookupSources: Array<IDictionaryLookupSource> = [];
	if (activeLanguage) {
		lookupSources = activeLanguage.lookupSources;
	}

	return lookupSources;
};

const useRemoveLanguageConfig = () => {
	const queryClient = useQueryClient();

	return useMutation(
		(languageConfigId: string) => {
			return removeLanguageConfig(languageConfigId);
		},
		{
			onSuccess: () => {
				queryClient.invalidateQueries(['userConfig']);
			},
			onError: (response: IApiResponse<void>) => {
				handleError(response.message);
			},
		}
	);
};

const useAddLanguageConfig = () => {
	const queryClient = useQueryClient();

	return useMutation(
		(languageConfig: Omit<ILanguageConfig, 'id'>) => {
			return addLanguageConfig(languageConfig);
		},
		{
			onSuccess: () => {
				queryClient.invalidateQueries(['userConfig']);
			},
			onError: (response: IApiResponse<void>) => {
				handleError(response.message);
			},
		}
	);
};

const useUpdateEditorConfig = () => {
	const queryClient = useQueryClient();

	return useMutation(
		({ editorConfig }: { editorConfig: Partial<IEditorConfig> }) => {
			return updateEditorConfig({ editorConfig });
		},
		{
			onSuccess: () => {
				queryClient.invalidateQueries(['userConfig']);
			},
			onError: (response: IApiResponse<void>) => {
				handleError(response);
			},
		}
	);
};

const useUpdateLanguageConfig = () => {
	const queryClient = useQueryClient();

	return useMutation(
		({
			id,
			languageConfig,
		}: {
			id: string;
			languageConfig: Omit<ILanguageConfig, 'id'>;
		}) => {
			return updateLanguageConfig({ id, languageConfig });
		},
		{
			onSuccess: () => {
				queryClient.invalidateQueries(['userConfig']);
			},
			onError: (response: IApiResponse<void>) => {
				handleError(response);
			},
		}
	);
};

const useSetActiveLanguage = () => {
	const queryClient = useQueryClient();

	return useMutation(
		(id: string) => {
			return setActiveLanguage({ languageId: id });
		},
		{
			onSuccess: () => {
				queryClient.invalidateQueries(['dictEntries']);
				queryClient.invalidateQueries(['dictTags']);
				queryClient.invalidateQueries(['userConfig']);
			},
			onError: (response: IApiResponse<void>) => {
				handleError(response.message);
			},
		}
	);
};

const useUpdateConfig = () => {
	const queryClient = useQueryClient();

	return useMutation(
		(configToUpdate: IConfig) => {
			return saveConfig(configToUpdate);
		},
		{
			onSuccess: () => {
				queryClient.invalidateQueries(['dictEntries']);
				queryClient.invalidateQueries(['dictTags']);
				queryClient.invalidateQueries(['userConfig']);
			},
			onError: (response: IApiResponse<void>) => {
				handleError(response.message);
			},
		}
	);
};

export {
	useUserConfig,
	useActiveLanguageConf,
	useLanguageConfigs,
	useAddLanguageConfig,
	useUpdateLanguageConfig,
	useRemoveLanguageConfig,
	useSetActiveLanguage,
	useLookupSources,
	useUpdateConfig,
	useUpdateEditorConfig,
	useEditorConfig,
};
