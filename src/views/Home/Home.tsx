import React, { useEffect, useRef, useState } from 'react';
import { Outlet } from 'react-router-dom';

import { useSnackbar } from 'notistack';
import { useActiveLanguageConf } from '@hooks/ConfigQueryHooks';
import { Box, Grid, Paper } from '@mui/material';
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

			<Grid
				ref={contentRef}
				container
				direction="column"
				alignItems="center"
				sx={(theme) => ({
					pt: '100px',
					minHeight: '100vh',
					backgroundColor: theme.palette.secondary.light,
				})}
			>
				<Paper sx={{ width: '950px', mb: 1 }}>
					<main>
						<Outlet />
					</main>
				</Paper>

				<Box
					sx={(theme) => ({
						width: '100%',
						backgroundColor: theme.palette.secondary.light,
						pt: 4,
						marginTop: 'auto',
					})}
				>
					<footer>
						<Box
							sx={(theme) => ({
								height: '50px',
								color: theme.palette.secondary.dark,
								borderTop: `1px solid ${theme.palette.secondary.dark}`,
								width: '100%',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
							})}
						>
							YiLang!
						</Box>
					</footer>
				</Box>
			</Grid>
		</div>
	);
};

export default HomeView;
