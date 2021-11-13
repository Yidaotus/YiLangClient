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
import useClickOutside from '@hooks/useClickOutside';

const HomeView: React.FC = () => {
	const [activeDocument, changeActiveDocument] = useActiveDocument();
	const [settingsPopoverOpen, setSettingsPopoverOpen] = useState(false);
	const [loading, setLoading] = useState<string | null>(null);
	const contentRef = useRef<HTMLDivElement>(null);
	const settingsRef = useRef(null);
	useClickOutside(settingsRef, () => {
		setSettingsPopoverOpen(false);
	});

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
						<NavLink href="#" to={locationMap.home}>
							<Button
								className="bp3-minimal"
								icon="home"
								text="Home"
							/>
						</NavLink>
						<NavLink
							href="#"
							to={`${url}/editor/${activeDocument}`}
						>
							<Button
								className="bp3-minimal"
								icon="edit"
								text="Editor"
							/>
						</NavLink>
						<NavLink href="#" to={locationMap.dicitonary}>
							<Button
								className="bp3-minimal"
								icon="book"
								text="Dictionary"
							/>
						</NavLink>
						<NavLink href="#" to={locationMap.documents}>
							<Button
								className="bp3-minimal"
								icon="document"
								text="Documents"
							/>
						</NavLink>
						<Navbar.Divider />
						<Popover2
							placement="bottom"
							content={
								<div ref={settingsRef}>
									<SettingsPopover
										closePopover={() => {
											setSettingsPopoverOpen(false);
										}}
									/>
								</div>
							}
							onInteraction={() => {}}
							enforceFocus={false}
							isOpen={settingsPopoverOpen}
						>
							<Button
								className="bp3-minimal"
								icon="user"
								text=""
								onClick={() => {
									setSettingsPopoverOpen((open) => !open);
								}}
							/>
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
