import React, { useCallback } from 'react';
import { useNavigate } from 'react-router';
import {
	useActiveLanguageConf,
	useLanguageConfigs,
	useSetActiveLanguage,
} from '@hooks/ConfigQueryHooks';
import {
	Language as LanguageIcon,
	Logout,
	Logout as LogoutIcon,
	Settings,
	SettingsApplications as SettingsApplicationsIcon,
} from '@mui/icons-material';
import {
	Divider,
	Stack,
	Box,
	Select,
	FormControl,
	InputLabel,
	MenuItem,
	SelectChangeEvent,
	ListItemIcon,
} from '@mui/material';

const SettingsPopover: React.FC = () => {
	const activeLanguage = useActiveLanguageConf();
	const availableLanguages = useLanguageConfigs();
	const setActiveLanguage = useSetActiveLanguage();
	const navigate = useNavigate();

	const logoutConfirm = useCallback(() => {
		// dispatch(logout());
	}, []);

	const changeLanguage = useCallback(
		(selectedLanguageId: string) => {
			const languageConfig = availableLanguages.find(
				(langConf) => langConf.id === selectedLanguageId
			);
			if (languageConfig) {
				setActiveLanguage.mutate(selectedLanguageId);
			}
		},
		[availableLanguages, setActiveLanguage]
	);

	const handleLanguageChange = useCallback(
		(event: SelectChangeEvent<string | null>) => {
			if (event.target.value) {
				changeLanguage(event.target.value);
			}
		},
		[changeLanguage]
	);

	return (
		<>
			<MenuItem>
				<Stack
					spacing={2}
					direction="row"
					alignItems="center"
					sx={{
						display: 'flex',
						width: '100%',
					}}
				>
					<LanguageIcon />
					<Box sx={{ flexGrow: 1 }}>
						<FormControl
							variant="standard"
							size="small"
							sx={{ m: 1, minWidth: 120 }}
						>
							<InputLabel id="active-language-label">
								Active Language Config
							</InputLabel>
							<Select
								labelId="active-language-label"
								id="activa-language-select"
								value={activeLanguage?.id || ''}
								onChange={handleLanguageChange}
								label="Active Language"
							>
								{availableLanguages.map((language) => (
									<MenuItem value={language.id}>
										{language.name}
									</MenuItem>
								))}
							</Select>
						</FormControl>
					</Box>
				</Stack>
			</MenuItem>
			<Divider variant="middle" sx={{ width: '100%' }} />
			<MenuItem
				onClick={() => {
					navigate(`/home/settings`);
				}}
			>
				<ListItemIcon>
					<Settings fontSize="small" />
				</ListItemIcon>
				Settings
			</MenuItem>
			<MenuItem
				onClick={() => {
					navigate(`/home/settings`);
				}}
			>
				<ListItemIcon>
					<Logout fontSize="small" />
				</ListItemIcon>
				Logout
			</MenuItem>
		</>
	);
};

export default SettingsPopover;
