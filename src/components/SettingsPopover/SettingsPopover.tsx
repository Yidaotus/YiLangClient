import './SettingsPopover.css';
import React, { useCallback, useRef, useState } from 'react';
import { useHistory } from 'react-router';
import {
	useActiveLanguageConf,
	useLanguageConfigs,
	useSetActiveLanguage,
} from '@hooks/ConfigQueryHooks';
import useClickOutside from '@hooks/useClickOutside';
import {
	Alert,
	Button,
	Divider,
	Icon,
	Intent,
	MenuItem,
} from '@blueprintjs/core';
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

const SettingsPopover: React.FC<{ closePopover: () => void }> = ({
	closePopover,
}) => {
	const activeLanguage = useActiveLanguageConf();
	const popoverRef = useRef(null);
	useClickOutside(popoverRef, () => {});
	const [selectedLanguage, setSelectedLanguage] =
		useState<ILanguageConfig | null>(null);
	const [changeLanguageAlertOpen, setChangeLanguageAlertOpen] =
		useState(false);
	const availableLanguages = useLanguageConfigs();
	const setActiveLanguage = useSetActiveLanguage();
	const history = useHistory();

	const documentModified = false;
	const logoutConfirm = useCallback(() => {
		// dispatch(logout());
	}, []);

	const changeLanguage = useCallback(() => {
		if (selectedLanguage) {
			const languageConfig = availableLanguages.find(
				(langConf) => langConf.id === selectedLanguage.id
			);
			if (languageConfig) {
				setActiveLanguage.mutate(languageConfig.id);
			}
		}
		closePopover();
	}, [availableLanguages, setActiveLanguage, selectedLanguage, closePopover]);

	return (
		<div className="settings-popover" ref={popoverRef}>
			<Alert
				cancelButtonText="Cancel"
				confirmButtonText="Change language"
				icon="translate"
				intent={Intent.DANGER}
				isOpen={changeLanguageAlertOpen}
				onCancel={() => setChangeLanguageAlertOpen(false)}
				onConfirm={changeLanguage}
			>
				<p>This will reset the currently loaded Document. Continue? </p>
			</Alert>
			<div className="settings-language">
				<Icon icon="translate" />
				<LanguageSelect
					itemRenderer={renderLanguageConfig}
					onItemSelect={(item) => {
						setSelectedLanguage(item);
						setChangeLanguageAlertOpen(true);
					}}
					items={availableLanguages}
					popoverProps={{ minimal: true, usePortal: false }}
					className="settings-language-select"
					filterable={false}
				>
					<Button
						text={selectedLanguage?.name || 'note selected!'}
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
			>
				Settings
			</Button>
			<Divider style={{ marginTop: '12px', marginBottom: '12px' }} />
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
