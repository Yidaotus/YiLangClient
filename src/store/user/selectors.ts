import { ILanguageConfig } from 'Document/Config';
import { createSelector } from 'reselect';
import { IRootState } from '../index';
import { IUser, IUserState } from './types';

const selectActiveLanguageFromState = (
	state: IUserState
): ILanguageConfig | undefined => {
	const { languageConfigs, activeLanguage } = state.config;
	return languageConfigs.find((langConf) => langConf.key === activeLanguage);
};

const selectAvailableLanguageConfigs = (
	state: IRootState
): Array<ILanguageConfig> => state.user.config.languageConfigs;

const selectActiveLanguageConfig = createSelector(
	(state: IRootState) => state.user.config.languageConfigs,
	(state: IRootState) => state.user.config.activeLanguage,
	(languageConfigs, activeLanguage) => {
		return languageConfigs.find(
			(langConf) => langConf.key === activeLanguage
		);
	}
);

const selectActiveLookupSources = createSelector(
	selectActiveLanguageConfig,
	(activeLanguageConfig) => {
		if (activeLanguageConfig) {
			return activeLanguageConfig.lookupSources;
		}
		return [];
	}
);

const selectActiveUser = (state: IRootState): IUser | null => state.user.user;

// eslint-disable-next-line import/prefer-default-export
export {
	selectActiveLanguageConfig,
	selectActiveLanguageFromState,
	selectActiveLookupSources,
	selectAvailableLanguageConfigs,
	selectActiveUser,
};
