import './LanguageConfig.css';
import LangConfForm from '@components/Settings/LangConfForm/LangConfForm';
import { ILanguageConfig } from 'Document/Config';
import React, { useState } from 'react';
import {
	useAddLanguageConfig,
	useLanguageConfigs,
	useRemoveLanguageConfig,
	useUpdateLanguageConfig,
} from '@hooks/ConfigQueryHooks';
import PageHeader from '@components/PageHeader/PageHeader';
import { useForm } from 'react-hook-form';
import {
	Button,
	IconButton,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Box,
	List,
	ListItem,
	ListItemIcon,
	ListItemText,
} from '@mui/material';
import {
	Edit as EditIcon,
	Delete as DeleteIcon,
	Add as AddIcon,
	Language as LanguageIcon,
} from '@mui/icons-material';

const defaultConfig = {
	id: undefined,
	name: '',
	lookupSources: [],
};

const LanguageConfig: React.FC = () => {
	const availableLanguages = useLanguageConfigs();
	const [addFormVisible, setAddFormVisible] = useState(false);
	const [currentLanguageContext, setCurrentLanguageContext] = useState<
		string | null
	>(null);

	const languageFormContext = useForm<ILanguageConfig>();
	const { reset, handleSubmit } = languageFormContext;
	const updateLanguageConfig = useUpdateLanguageConfig();
	const addLanguageConfig = useAddLanguageConfig();
	const removeLanguageConfig = useRemoveLanguageConfig();

	const saveConfig = (configEntry: ILanguageConfig) => {
		if (configEntry.id) {
			updateLanguageConfig.mutate({
				id: configEntry.id,
				languageConfig: configEntry,
			});
		} else {
			addLanguageConfig.mutate(configEntry);
		}
		reset(defaultConfig);
		setAddFormVisible(false);
	};

	const editConfig = (key: string) => {
		const selectedLanguage = availableLanguages.find(
			(lang) => lang.id === key
		);
		if (selectedLanguage) {
			reset(selectedLanguage);
			setAddFormVisible(true);
		}
	};

	return (
		<Box sx={{ width: '100%' }}>
			<Dialog
				open={!!currentLanguageContext}
				onClose={() => setCurrentLanguageContext(null)}
			>
				<DialogTitle>Really delete</DialogTitle>
				<DialogContent>
					<DialogContentText>Forever gone!</DialogContentText>
				</DialogContent>
				<DialogActions>
					<IconButton
						onClick={() => {
							if (currentLanguageContext) {
								removeLanguageConfig.mutate(
									currentLanguageContext
								);
								setCurrentLanguageContext(null);
							}
						}}
					>
						<DeleteIcon />
					</IconButton>
				</DialogActions>
			</Dialog>
			<Dialog
				onClose={() => {
					setAddFormVisible(false);
				}}
				open={addFormVisible}
				fullWidth
				maxWidth="lg"
			>
				<DialogTitle>Add Language</DialogTitle>
				<form onSubmit={handleSubmit(saveConfig)}>
					<DialogContent>
						<LangConfForm {...languageFormContext} />
					</DialogContent>
					<DialogActions>
						<Button
							variant="outlined"
							onClick={() => {
								reset(defaultConfig);
								setAddFormVisible(false);
							}}
						>
							Cancel
						</Button>
						<Button
							variant="outlined"
							type="submit"
							startIcon={<AddIcon />}
						>
							Save
						</Button>
					</DialogActions>
				</form>
			</Dialog>

			<PageHeader
				title="Language Configurations"
				subtitle="Change your language settings"
				options={
					<Button onClick={() => setAddFormVisible(true)}>
						Add language
					</Button>
				}
			/>
			<List>
				{availableLanguages.map((language) => (
					<ListItem
						secondaryAction={
							<>
								<IconButton
									edge="end"
									aria-label="delete"
									onClick={() => {
										setCurrentLanguageContext(language.id);
									}}
								>
									<DeleteIcon />
								</IconButton>
								<IconButton
									onClick={() => editConfig(language.id)}
								>
									<EditIcon />
								</IconButton>
							</>
						}
					>
						<ListItemIcon>
							<LanguageIcon />
						</ListItemIcon>
						<ListItemText
							primary={language.name}
							secondary={language.lookupSources
								.map((luSource) => luSource.name)
								.join(', ')}
						/>
					</ListItem>
				))}
			</List>
		</Box>
	);
};

export default LanguageConfig;
