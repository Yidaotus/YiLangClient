import './Home.css';
import React, { useEffect, useState } from 'react';
import {
	Switch,
	Route,
	NavLink,
	useRouteMatch,
	useHistory,
} from 'react-router-dom';

import Editor from 'views/Home/Editor/Yitext';
import {
	Menu,
	Col,
	Row,
	notification,
	Spin,
	Avatar,
	Badge,
	Popover,
} from 'antd';
import Dictionary from 'views/Home/Dictionary/Dictionary';
import Documents from 'views/Home/Documents/Documents';
import DictionaryEntryPage from 'views/Home/DictionaryEntry/DictionaryEntryPage';
import { UserOutlined } from '@ant-design/icons';
import SettingsPopover from '@components/SettingsPopover/SettingsPopover';
import handleError from '@helpers/Error';
import { useActiveLanguageConf } from '@hooks/ConfigQueryHooks';
import Overview from './Overview/Overview';
import Settings from './Settings/Settings';

const HomeView: React.FC = () => {
	const [loading, setLoading] = useState<string | null>(null);

	const { url } = useRouteMatch();
	const { location } = useHistory();

	const activeLanguage = useActiveLanguageConf();

	const locationMap = {
		home: `${url}`,
		user: `${url}/settings`,
		editor: `${url}/editor`,
		dicitonary: `${url}/dictionary`,
		documents: `${url}/docs`,
		dicitonaryEntry: `${url}/dictionary/:entryId`,
		settings: `${url}/settings`,
	};

	useEffect(() => {
		const init = async () => {
			setLoading('Initializing');
			try {
				notification.open({
					message: 'Done',
					description: `YiLang initialized`,
					type: 'success',
				});
			} catch (e: unknown) {
				handleError(e);
			}
			setLoading(null);
		};
		init();
	}, []);

	useEffect(() => {
		if (activeLanguage) {
			notification.open({
				message: 'Done',
				description: `YiLang initialized for ${activeLanguage.name}!`,
				type: 'success',
			});
		}
	}, [activeLanguage]);

	return (
		<div className="yi-layout">
			<header className="yi-header">
				<NavLink href="#" to={locationMap.home}>
					<img
						alt="YiLang.png"
						src="/yilang.png"
						className="yi-logo"
					/>
				</NavLink>
				<div className="yi-header-links">
					<Menu mode="horizontal" selectedKeys={[location.pathname]}>
						<Menu.Item key={locationMap.home}>
							<NavLink href="#" to={locationMap.home}>
								Home
							</NavLink>
						</Menu.Item>
						<Menu.Item key={locationMap.editor}>
							<NavLink href="#" to={locationMap.editor}>
								Editor
							</NavLink>
						</Menu.Item>
						<Menu.Item key={locationMap.dicitonary}>
							<NavLink href="#" to={locationMap.dicitonary}>
								Dictionary
							</NavLink>
						</Menu.Item>
						<Menu.Item key={locationMap.documents}>
							<NavLink href="#" to={locationMap.documents}>
								Documents
							</NavLink>
						</Menu.Item>
						<Menu.Item key={locationMap.user}>
							<Popover
								placement="bottomRight"
								arrowPointAtCenter
								content={<SettingsPopover />}
								trigger="click"
							>
								<Badge count={0}>
									<Avatar
										shape="circle"
										icon={<UserOutlined />}
									/>
								</Badge>
							</Popover>
						</Menu.Item>
					</Menu>
				</div>
			</header>

			<main className="yi-content">
				<Spin spinning={!!loading} tip={loading || ''}>
					<Row justify="center" align="top">
						<Col style={{ width: '1024px' }}>
							<Switch>
								<Route path={locationMap.home} exact>
									<Overview />
								</Route>
								<Route path={locationMap.documents}>
									<Documents />
								</Route>
								<Route path={locationMap.dicitonaryEntry}>
									<DictionaryEntryPage />
								</Route>
								<Route path={locationMap.dicitonary}>
									<Dictionary />
								</Route>
								<Route path={locationMap.editor}>
									<Editor />
								</Route>
								<Route path={locationMap.settings}>
									<Settings />
								</Route>
							</Switch>
						</Col>
					</Row>
				</Spin>
			</main>
			<footer className="yi-footer-container">
				<div className="yi-footer">YiLang!</div>
			</footer>
		</div>
	);
};

export default HomeView;
