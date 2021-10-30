import handleError from '@helpers/Error';
import LanguageConfig from '@views/Home/Settings/LanguageConfig/LanguageConfig';
import {
	removeLanguageConfig,
	addLanguageConfig,
	updateLanguageConfig,
	fetchConfig,
	saveConfig,
	setActiveLanguage,
} from 'api/config.service.';
import { IApiResponse } from 'api/definitions/api';
import {
	IConfig,
	IDictionaryLookupSource,
	ILanguageConfig,
} from 'Document/Config';
import { act } from 'react-dom/test-utils';
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
};
