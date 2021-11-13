import './SettingsPopover.css';
import React, { useCallback } from 'react';
import { useHistory } from 'react-router';
import {
	useActiveLanguageConf,
	useLanguageConfigs,
	useSetActiveLanguage,
} from '@hooks/ConfigQueryHooks';
import { Button, Divider, Icon, Intent, MenuItem } from '@blueprintjs/core';
import { ItemRenderer, Select } from '@blueprintjs/select';
import { ILanguageConfig } from '../../Document/Config';

const LanguageSelect = Select.ofType<ILanguageConfig>();

export const renderLanguageConfig: ItemRenderer<ILanguageConfig> = (
	config,
	{ handleClick, modifiers, query }
) => {
	if (!modifiers.matchesPredicate) {
		return null;
	}
	return (
		<MenuItem
			active={modifiers.active}
			disabled={modifiers.disabled}
			key={config.id}
			onClick={handleClick}
			text={config.name}
		/>
	);
};

const SettingsPopover: React.FC = () => {
	const activeLanguage = useActiveLanguageConf();
	const availableLanguages = useLanguageConfigs();
	const setActiveLanguage = useSetActiveLanguage();
	const history = useHistory();

	const documentModified = false;
	const logoutConfirm = useCallback(() => {
		// dispatch(logout());
	}, []);

	const changeLanguage = useCallback(
		(selectedLanguage: ILanguageConfig) => {
			const languageConfig = availableLanguages.find(
				(langConf) => langConf.id === selectedLanguage.id
			);
			if (languageConfig) {
				setActiveLanguage.mutate(languageConfig.id);
			}
		},
		[availableLanguages, setActiveLanguage]
	);

	return (
		<div className="settings-popover">
			<div className="settings-language">
				<Icon
					icon="translate"
					style={{ marginRight: '5px', marginLeft: '5px' }}
				/>
				<LanguageSelect
					activeItem={activeLanguage}
					itemRenderer={renderLanguageConfig}
					onItemSelect={(item) => {
						changeLanguage(item);
					}}
					items={availableLanguages}
					popoverProps={{ minimal: true, usePortal: false }}
					className="settings-language-select"
					filterable={false}
					fill
				>
					<Button
						text={activeLanguage?.name || 'note selected!'}
						minimal
						fill
						rightIcon="double-caret-vertical"
					/>
				</LanguageSelect>
			</div>
			<Divider />
			<Button
				icon="settings"
				onClick={() => {
					history.push(`/home/settings`);
				}}
				fill
				minimal
			>
				Settings
			</Button>
			<Divider />
			<Button
				intent={Intent.DANGER}
				icon="log-out"
				style={{ width: '100%' }}
				onClick={logoutConfirm}
			>
				Logout
			</Button>
		</div>
	);
};

export default SettingsPopover;
