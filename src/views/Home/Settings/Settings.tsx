import './Settings.css';
import {
	EditOutlined,
	TranslationOutlined,
	UserOutlined,
} from '@ant-design/icons';
import { PageHeader, Tabs } from 'antd';
import React from 'react';
import { useHistory } from 'react-router';
import LanguageConfig from './LanguageConfig/LanguageConfig';
import EditorConfig from './EditorConfig/EditorConfig';

const { TabPane } = Tabs;

const Settings: React.FC = () => {
	const history = useHistory();

	return (
		<PageHeader
			onBack={() => {
				history.goBack();
			}}
			title="Settings"
			subTitle="Change your settings"
			ghost={false}
			className="config-container"
		>
			<Tabs tabPosition="left">
				<TabPane
					tab={
						<span>
							<UserOutlined /> Account
						</span>
					}
					key="1"
				>
					Account
				</TabPane>
				<TabPane
					tab={
						<span>
							<EditOutlined /> Editor
						</span>
					}
					key="2"
				>
					<EditorConfig />
				</TabPane>
				<TabPane
					tab={
						<span>
							<TranslationOutlined />
							Languages
						</span>
					}
					key="3"
					style={{ height: '100%' }}
				>
					<LanguageConfig />
				</TabPane>
			</Tabs>
		</PageHeader>
	);
};

export default Settings;
