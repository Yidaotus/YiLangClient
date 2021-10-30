import handleError from '@helpers/Error';
import LanguageConfig from '@views/Home/Settings/LanguageConfig/LanguageConfig';
import {
	removeLanguageConfig,
	addLanguageConfig,
	updateLanguageConfig,
	fetchConfig,
	saveConfig,
} from 'api/config.service.';
import { IApiResponse } from 'api/definitions/api';
import { IConfig, ILanguageConfig } from 'Document/Config';
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

const useRemoveLanguageConfig = () => {
	const queryClient = useQueryClient();

	return useMutation(
		(languageConfigId: string) => {
			return removeLanguageConfig(languageConfigId);
		},
		{
			onSuccess: (_, languageConfigId) => {
				queryClient.invalidateQueries([
					'dictEntries',
					languageConfigId,
				]);
				queryClient.invalidateQueries(['dictTags', languageConfigId]);
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
			onSuccess: (response) => {
				queryClient.invalidateQueries(['dictEntries', response]);
				queryClient.invalidateQueries(['dictTags', response]);
				queryClient.invalidateQueries([
					'userConfig',
					'language',
					response,
				]);
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
			onSuccess: (_, languageConfig) => {
				queryClient.invalidateQueries([
					'dictEntries',
					languageConfig.id,
				]);
				queryClient.invalidateQueries(['dictTags', languageConfig.id]);
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
	useUpdateConfig,
};
