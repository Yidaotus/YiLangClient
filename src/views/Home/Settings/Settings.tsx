import './Settings.css';
import React from 'react';
import { Divider, Icon, Tab, Tabs } from '@blueprintjs/core';
import { useHistory } from 'react-router';
import LanguageConfigPanel from './LanguageConfig/LanguageConfig';
import EditorConfigPanel from './EditorConfig/EditorConfig';

const Settings: React.FC = () => (
	<div className="config-container">
		<h2 className="bp3-heading">Settings</h2>
		<h3 className="bp3-heading">Change your Settings</h3>
		<Divider />
		<Tabs
			vertical
			animate
			id="SettingsTabs"
			key="SettingsTabs"
			renderActiveTabPanelOnly
		>
			<Tab
				title={
					<span style={{ display: 'flex', alignItems: 'center' }}>
						<Icon icon="user" />
						<span style={{ marginLeft: '5px' }}>Account</span>
					</span>
				}
				id="1"
				key="1"
				panel={<span>Account</span>}
			/>
			<Tab
				title={
					<span style={{ display: 'flex', alignItems: 'center' }}>
						<Icon icon="edit" />
						<span style={{ marginLeft: '5px' }}>Editor</span>
					</span>
				}
				id="2"
				key="2"
				panel={<EditorConfigPanel />}
			/>
			<Tab
				title={
					<span style={{ display: 'flex', alignItems: 'center' }}>
						<Icon icon="translate" />
						<span style={{ marginLeft: '5px' }}>Languages</span>
					</span>
				}
				id="3"
				key="3"
				panel={<LanguageConfigPanel />}
			/>
			<Tabs.Expander />
		</Tabs>
	</div>
);

export default Settings;
