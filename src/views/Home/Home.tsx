import './Home.css';
import React, { useEffect, useRef, useState } from 'react';
import { Outlet } from 'react-router-dom';

import { useActiveLanguageConf } from '@hooks/ConfigQueryHooks';
import { useSnackbar } from 'notistack';
import ResponsiveAppBar from './AppBar';
import useUiErrorHandler from '@helpers/useUiErrorHandler';

const HomeView: React.FC = () => {
	const [loading, setLoading] = useState(false);
	const contentRef = useRef<HTMLDivElement>(null);
	const activeLanguage = useActiveLanguageConf();
	const { enqueueSnackbar } = useSnackbar();
	const handleError = useUiErrorHandler();

	useEffect(() => {
		const init = async () => {
			setLoading(true);
			try {
				enqueueSnackbar(`YiLang initialized`, { variant: 'success' });
			} catch (e: unknown) {
				handleError(e);
			}
			setLoading(false);
		};
		init();
	}, [enqueueSnackbar, handleError]);

	useEffect(() => {
		if (activeLanguage) {
			enqueueSnackbar(`YiLang initialized for ${activeLanguage.name}!`, {
				variant: 'success',
			});
		}
	}, [activeLanguage, enqueueSnackbar]);

	return (
		<div>
			<header>
				<ResponsiveAppBar />
			</header>

			<main className="yi-layout">
				<div className="yi-content" ref={contentRef}>
					<Outlet />
				</div>
			</main>
			<footer className="yi-footer-container">
				<div className="yi-footer">YiLang!</div>
			</footer>
		</div>
	);
};

export default HomeView;
