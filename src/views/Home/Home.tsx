import './Home.css';
import React, { useEffect, useRef, useState } from 'react';
import { useLocation, Routes, Route, Outlet } from 'react-router-dom';

import handleError from '@helpers/Error';
import { useActiveLanguageConf } from '@hooks/ConfigQueryHooks';
import { useSnackbar } from 'notistack';
import ResponsiveAppBar from './AppBar';

const HomeView: React.FC = () => {
	const [loading, setLoading] = useState(false);
	const contentRef = useRef<HTMLDivElement>(null);
	const activeLanguage = useActiveLanguageConf();
	const { enqueueSnackbar } = useSnackbar();
	const url = useLocation();

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
	}, [enqueueSnackbar]);

	useEffect(() => {
		if (activeLanguage) {
			enqueueSnackbar(`YiLang initialized for ${activeLanguage.name}!`, {
				variant: 'success',
			});
		}
	}, [activeLanguage, enqueueSnackbar]);

	return (
		<div className="yi-layout">
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
