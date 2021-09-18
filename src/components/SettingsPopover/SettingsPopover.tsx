import './SettingsPopover.css';
import React, { useCallback } from 'react';
import { Select, Modal, Divider, Button } from 'antd';
import {
	ExclamationCircleOutlined,
	LogoutOutlined,
	SettingOutlined,
	TranslationOutlined,
} from '@ant-design/icons';
import { IRootDispatch, IRootState } from '@store/index';
import { logout, selectLanguage } from '@store/user/actions';
import { resetEditor } from '@store/editor/actions';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router';
import {
	selectActiveLanguageConfig,
	selectAvailableLanguageConfigs,
} from '@store/user/selectors';

const { Option } = Select;
const { confirm } = Modal;

const SettingsPopover: React.FC = () => {
	const documentLoaded = useSelector(
		(state: IRootState) => !!state.editor.document
	);
	const documentModified = useSelector(
		(state: IRootState) => !!state.editor.documentModified
	);
	const selectedLanguage = useSelector(selectActiveLanguageConfig);
	const availableLanguages = useSelector(selectAvailableLanguageConfigs);
	const dispatch: IRootDispatch = useDispatch();
	const history = useHistory();

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
					dispatch(logout());
				},
			});
		} else {
			dispatch(logout());
		}
	}, [dispatch, documentModified]);

	const changeLanguage = useCallback(
		(configKey: string) => {
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
							(langConf) => langConf.key === configKey
						);
						if (languageConfig) {
							dispatch(resetEditor());
							dispatch(selectLanguage(languageConfig));
						}
					},
				});
			} else {
				const languageConfig = availableLanguages.find(
					(langConf) => langConf.key === configKey
				);
				if (languageConfig) {
					dispatch(selectLanguage(languageConfig));
				}
			}
		},
		[availableLanguages, dispatch, documentLoaded]
	);

	return (
		<div className="settings-popover">
			<div className="settings-language">
				<TranslationOutlined />
				<Select
					defaultValue={selectedLanguage?.key || ''}
					value={selectedLanguage?.key}
					onChange={changeLanguage}
					className="settings-language-select"
				>
					{availableLanguages.map((lang) => (
						<Option key={lang.key} value={lang.key}>
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
