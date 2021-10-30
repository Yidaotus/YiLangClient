import { ILanguageConfig } from 'Document/Config';
import useUserConfig from './useUserConfig';

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
				(langConf) => langConf.key === userConfig.activeLanguage
			) || null;
	}

	return activeConfig || null;
};

export { useActiveLanguageConf, useLanguageConfigs };
