import { ILanguageConfig } from 'Document/Config';
import useUserConfig from './useUserConfig';

const useActiveLanguageConf = (): ILanguageConfig | null => {
	const userConfig = useUserConfig();
	let activeConfig: ILanguageConfig | null = null;
	if (userConfig) {
		activeConfig =
			userConfig.languageConfigs.find(
				(langConf) => langConf.key === userConfig.activeLanguage
			) || null;
	}
	return activeConfig;
};

export default useActiveLanguageConf;
