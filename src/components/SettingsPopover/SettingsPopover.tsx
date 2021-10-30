import './SettingsPopover.css';
import React, { useCallback } from 'react';
import { Select, Modal, Divider, Button } from 'antd';
import {
	ExclamationCircleOutlined,
	LogoutOutlined,
	SettingOutlined,
	TranslationOutlined,
} from '@ant-design/icons';
import { useHistory } from 'react-router';
import {
	useActiveLanguageConf,
	useLanguageConfigs,
} from '@hooks/useActiveLanguageConf';

const { Option } = Select;
const { confirm } = Modal;

const SettingsPopover: React.FC = () => {
	const selectedLanguage = useActiveLanguageConf();
	const availableLanguages = useLanguageConfigs();
	const history = useHistory();

	const documentModified = false;
	const logoutConfirm = useCallback(() => {
		if (documentModified) {
			confirm({
				title: 'Unsaved Document',
				icon: <ExclamationCircleOutlined />,
				content: `The current document was modified but not saved. Logging out without saving?`,
				okText: 'Yes',
				okType: 'primary',
				cancelText: 'No',
				onOk() {
					// TODO
					// dispatch(logout());
				},
			});
		} else {
			// TODO
			// dispatch(logout());
		}
	}, [documentModified]);

	const changeLanguage = useCallback(
		(configKey: string) => {
			const documentLoaded = false;
			if (documentLoaded) {
				confirm({
					title: 'Changing language',
					icon: <ExclamationCircleOutlined />,
					content: `This will reset the currently loaded Document. Continue?`,
					okText: 'Yes',
					okType: 'primary',
					cancelText: 'No',
					onOk() {
						const languageConfig = availableLanguages.find(
							(langConf) => langConf.id === configKey
						);
						if (languageConfig) {
							// TODO
							// dispatch(resetEditor());
							// dispatch(selectLanguage(languageConfig));
						}
					},
				});
			} else {
				const languageConfig = availableLanguages.find(
					(langConf) => langConf.id === configKey
				);
				if (languageConfig) {
					// TODO
					// dispatch(selectLanguage(languageConfig));
				}
			}
		},
		[availableLanguages]
	);

	return (
		<div className="settings-popover">
			<div className="settings-language">
				<TranslationOutlined />
				<Select
					defaultValue={selectedLanguage?.id || ''}
					value={selectedLanguage?.id}
					onChange={changeLanguage}
					className="settings-language-select"
				>
					{availableLanguages.map((lang) => (
						<Option key={lang.id} value={lang.id}>
							{lang.name}
						</Option>
					))}
				</Select>
			</div>
			<Divider style={{ marginTop: '12px', marginBottom: '12px' }} />
			<Button
				type="default"
				icon={<SettingOutlined />}
				style={{ width: '100%' }}
				onClick={() => {
					history.push(`/home/settings`);
				}}
			>
				Settings
			</Button>
			<Divider style={{ marginTop: '12px', marginBottom: '12px' }} />
			<Button
				danger
				type="default"
				icon={<LogoutOutlined />}
				style={{ width: '100%' }}
				onClick={logoutConfirm}
			>
				Logout
			</Button>
		</div>
	);
};

export default SettingsPopover;
