import React from 'react';
import './App.css';
import { Routes, Route, BrowserRouter, Navigate } from 'react-router-dom';
import PrivateRoute from '@components/PrivateRoute';
import Home from '@views/Home/Home';
import Login from '@views/Login';
import Verify from '@views/Verify';
import AuthProvider, { Role } from '@components/AuthProvider/AuthProvider';
import { ReactQueryDevtools } from 'react-query/devtools';
import { QueryClient, QueryClientProvider } from 'react-query';

import Overview from '@views/Home/Overview/Overview';
import Documents from '@views/Home/Documents/Documents';
import DictionaryEntryPage from '@views/Home/DictionaryEntry/DictionaryEntryPage';
import Dictionary from '@views/Home/Dictionary/Dictionary';
import Editor from '@editor/Editor';
import Settings from '@views/Home/Settings/Settings';

import { SnackbarProvider } from 'notistack';

import { createTheme, ThemeProvider } from '@mui/material/styles';
import CloseSharpIcon from '@mui/icons-material/CloseSharp';

const queryClient = new QueryClient({
	defaultOptions: { queries: { staleTime: 60000 } },
});

const baseTheme = createTheme({
	palette: {
		mode: 'light',
		primary: {
			main: '#24424b',
		},
	},
});

const theme = createTheme(baseTheme, {
	components: {
		MuiTableHead: {
			styleOverrides: {
				root: {
					'& th': {
						backgroundColor: baseTheme.palette.grey,
					},
				},
			},
		},
		MuiTableRow: {
			styleOverrides: {
				root: {
					'&:nth-of-type(odd)': {
						backgroundColor: baseTheme.palette.action.hover,
					},
					// hide last border
					'&:last-child td': {
						border: 0,
					},
				},
			},
		},
		MuiChip: {
			defaultProps: {
				deleteIcon: <CloseSharpIcon sx={{ height: '15px' }} />,
			},
			styleOverrides: {
				root: {
					borderRadius: '2px',
					height: '20px',
					'& svg': {
						'& :hover': {
							color: 'red',
						},
					},
				},
			},
		},
		MuiTextField: {
			defaultProps: {
				size: 'small',
			},
		},
		MuiOutlinedInput: {
			styleOverrides: {
				root: {
					borderRadius: '1px',
				},
			},
			defaultProps: {
				size: 'small',
			},
		},
		MuiIconButton: {
			styleOverrides: {
				root: {
					borderRadius: '1px',
				},
			},
			defaultProps: {
				size: 'small',
			},
		},
		MuiAppBar: {
			styleOverrides: {
				root: {
					'& .MuiTabs-root .MuiButtonBase-root': {
						'&.Mui-selected': {
							color: '#FFFFFF',
						},
						color: '#AAAAAA',
					},
				},
			},
		},
		MuiAutocomplete: {
			styleOverrides: {
				paper: {
					borderRadius: '0px',
				},
			},
			defaultProps: {
				size: 'small',
			},
		},
	},
});

const locationMap = {
	home: ``,
	user: `settings`,
	editor: `editor/:id`,
	dictionary: `dictionary`,
	documents: `documents`,
	dictionaryEntry: `dictionary/:entryId`,
	settings: `settings`,
};

const App: React.FC = () => {
	return (
		<QueryClientProvider client={queryClient}>
			<ThemeProvider theme={theme}>
				<SnackbarProvider maxSnack={3}>
					<AuthProvider>
						<BrowserRouter>
							<Routes>
								<Route
									path="/"
									element={<Navigate to="/home" />}
								/>
								<Route path="/login" element={<Login />} />
								<Route
									path="/verify/:code"
									element={<Verify />}
								/>
								<Route
									path="/home"
									element={
										<PrivateRoute
											roles={[Role.ADMIN, Role.USER]}
										>
											<Home />{' '}
										</PrivateRoute>
									}
								>
									<Route
										path={locationMap.home}
										element={<Overview />}
									/>
									<Route
										path={locationMap.documents}
										element={<Documents />}
									/>
									<Route
										path={locationMap.dictionaryEntry}
										element={<DictionaryEntryPage />}
									/>
									<Route
										path={locationMap.dictionary}
										element={<Dictionary />}
									/>
									<Route
										path={locationMap.editor}
										element={<Editor />}
									/>
									<Route
										path={locationMap.settings}
										element={<Settings />}
									/>
								</Route>
							</Routes>
						</BrowserRouter>
					</AuthProvider>
				</SnackbarProvider>
			</ThemeProvider>
			<ReactQueryDevtools initialIsOpen={false} />
		</QueryClientProvider>
	);
};

export default App;
