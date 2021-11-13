import './Home.css';
import React, { useEffect, useRef, useState } from 'react';
import {
	useRouteMatch,
	useHistory,
	NavLink,
	Switch,
	Route,
} from 'react-router-dom';

import { useActiveDocument } from '@hooks/useUserContext';
import handleError from '@helpers/Error';
import { useActiveLanguageConf } from '@hooks/ConfigQueryHooks';
import {
	Navbar,
	Button,
	Alignment,
	Spinner,
	Intent,
	Overlay,
	PopoverInteractionKind,
	Tabs,
	Tab,
	Icon,
	IconName,
} from '@blueprintjs/core';
import { Popover2 } from '@blueprintjs/popover2';
import SettingsPopover from '@components/SettingsPopover/SettingsPopover';
import Overview from '@views/Home/Overview/Overview';
import Documents from '@views/Home/Documents/Documents';
import DictionaryEntryPage from '@views/Home/DictionaryEntry/DictionaryEntryPage';
import Dictionary from '@views/Home/Dictionary/Dictionary';
import Editor from '@editor/Editor';
import AppToaster from '@components/Toaster';
import Settings from '@views/Home/Settings/Settings';

interface INavButtonProps {
	to: string;
	icon: IconName;
	text: string;
}
const NavButton: React.FC<INavButtonProps> = ({ to, icon, text }) => (
	<NavLink href="#" to={to}>
		<span
			style={{
				display: 'flex',
				alignItems: 'center',
			}}
		>
			<Icon icon={icon} />
			<span style={{ marginLeft: '5px' }}>{text}</span>
		</span>
	</NavLink>
);

const HomeView: React.FC = () => {
	const [activeDocument, changeActiveDocument] = useActiveDocument();
	const [loading, setLoading] = useState<string | null>(null);
	const contentRef = useRef<HTMLDivElement>(null);

	const { url } = useRouteMatch();
	const { location } = useHistory();

	const activeLanguage = useActiveLanguageConf();

	const locationMap = {
		home: `${url}`,
		user: `${url}/settings`,
		editor: `${url}/editor/:id`,
		dicitonary: `${url}/dictionary`,
		documents: `${url}/docs`,
		dicitonaryEntry: `${url}/dictionary/:entryId`,
		settings: `${url}/settings`,
	};

	useEffect(() => {
		const init = async () => {
			setLoading('Initializing');
			try {
				AppToaster.show({
					message: `YiLang initialized`,
					intent: Intent.SUCCESS,
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
			AppToaster.show({
				message: `YiLang initialized for ${activeLanguage.name}!`,
				intent: Intent.SUCCESS,
			});
		}
	}, [activeLanguage]);

	return (
		<div className="yi-layout">
			<header>
				<Navbar>
					<Navbar.Group align={Alignment.LEFT}>
						<Navbar.Heading>
							<NavLink href="#" to={locationMap.home}>
								<img
									alt="YiLang.png"
									src="/yilang.png"
									className="yi-logo"
								/>
							</NavLink>
						</Navbar.Heading>
					</Navbar.Group>
					<Navbar.Group align={Alignment.RIGHT}>
						<Tabs
							animate
							id="navbar"
							large
							selectedTabId={location.pathname}
						>
							<Tab
								id={locationMap.home}
								title={
									<NavButton
										to={locationMap.home}
										icon="home"
										text="Home"
									/>
								}
							/>
							<Tab
								id={locationMap.editor}
								title={
									<NavButton
										to={`${url}/editor/${activeDocument}`}
										icon="edit"
										text="Editor"
									/>
								}
							/>
							<Tab
								id={locationMap.dicitonary}
								title={
									<NavButton
										to={locationMap.dicitonary}
										icon="book"
										text="Dictionary"
									/>
								}
							/>
							<Tab
								id={locationMap.documents}
								title={
									<NavButton
										to={locationMap.documents}
										icon="document"
										text="Documents"
									/>
								}
							/>
						</Tabs>
						<Navbar.Divider />
						<Popover2
							interactionKind={PopoverInteractionKind.CLICK}
							content={<SettingsPopover />}
							modifiers={{
								arrow: { enabled: true },
								flip: { enabled: true },
								preventOverflow: { enabled: true },
							}}
						>
							<Button minimal icon="user" tabIndex={0} />
						</Popover2>
					</Navbar.Group>
				</Navbar>
			</header>

			<main className="yi-layout">
				<div className="yi-content" ref={contentRef}>
					<Overlay isOpen={!!loading} usePortal={false}>
						<Spinner />
					</Overlay>
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
				</div>
			</main>
			<footer className="yi-footer-container">
				<div className="yi-footer">YiLang!</div>
			</footer>
		</div>
	);
};

export default HomeView;
