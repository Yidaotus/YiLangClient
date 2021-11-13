import './LanguageConfig.css';
import InnerModal from '@components/InnerModal/InnerModal';
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
import { Alert, Button, Card, Classes, Intent } from '@blueprintjs/core';
import { useForm } from 'react-hook-form';

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
		console.log(configEntry);
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
		<div>
			<Alert
				confirmButtonText="Delete"
				intent={Intent.DANGER}
				icon="trash"
				isOpen={!!currentLanguageContext}
				onClose={() => setCurrentLanguageContext(null)}
				onConfirm={() => {
					if (currentLanguageContext) {
						removeLanguageConfig.mutate(currentLanguageContext);
						setCurrentLanguageContext(null);
					}
				}}
			>
				<p>Forever gone!</p>
			</Alert>
			<PageHeader
				title="Language Configurations"
				subtitle="Change your language settings"
				options={
					<Button
						intent={Intent.PRIMARY}
						onClick={() => setAddFormVisible(true)}
					>
						Add language
					</Button>
				}
			/>
			{addFormVisible && (
				<InnerModal
					onClose={() => {
						setAddFormVisible(false);
					}}
					width="600px"
				>
					<Card>
						<form onSubmit={handleSubmit(saveConfig)}>
							<LangConfForm {...languageFormContext} />
							<div className="add-form-actions">
								<Button
									onClick={() => {
										handleSubmit(saveConfig);
									}}
									type="submit"
									intent={Intent.PRIMARY}
								>
									Save
								</Button>
								<Button
									onClick={() => {
										reset(defaultConfig);
										setAddFormVisible(false);
									}}
									intent={Intent.DANGER}
								>
									Cancel
								</Button>
							</div>
						</form>
					</Card>
				</InnerModal>
			)}

			<div>
				{availableLanguages.map((language) => (
					<Card>
						<PageHeader
							title={language.name}
							subtitle={language.lookupSources
								.map((luSource) => luSource.name)
								.join(', ')}
							options={
								<div>
									<Button
										icon="edit"
										minimal
										onClick={() => editConfig(language.id)}
									/>
									<Button
										icon="trash"
										intent={Intent.DANGER}
										minimal
										onClick={() =>
											setCurrentLanguageContext(
												language.id
											)
										}
									/>
								</div>
							}
						/>
					</Card>
				))}
			</div>
		</div>
	);
};

export default LanguageConfig;
