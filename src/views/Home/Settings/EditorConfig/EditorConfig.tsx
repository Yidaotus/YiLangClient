import './EditorConfig.css';
import { IEditorConfig } from 'Document/Config';
import React, { useEffect } from 'react';
import {
	useEditorConfig,
	useUpdateEditorConfig,
} from '@hooks/ConfigQueryHooks';
import { useForm, Controller } from 'react-hook-form';
import PageHeader from '@components/PageHeader/PageHeader';
import {
	Divider,
	TextField,
	Switch,
	Button,
	FormGroup,
	FormControlLabel,
} from '@mui/material';

const LanguageConfigPanel: React.FC = () => {
	const currentConfig = useEditorConfig();
	const updateEditorConfig = useUpdateEditorConfig();
	const { control, handleSubmit, reset } = useForm<IEditorConfig>({
		defaultValues: {
			autoSave: true,
			saveEveryNActions: 15,
		},
	});

	useEffect(() => {
		if (currentConfig) {
			reset(currentConfig);
		}
	}, [currentConfig, reset]);

	const saveConfig = (newConfig: IEditorConfig) => {
		const newConfigWithoutNullishValues = Object.fromEntries(
			Object.entries(newConfig).filter(([, v]) => v != null && v !== '')
		);
		if (Object.keys(newConfigWithoutNullishValues).length > 0) {
			updateEditorConfig.mutate({
				editorConfig: newConfigWithoutNullishValues,
			});
		}
		reset();
	};

	return (
		<div className="editor-config-panel">
			<PageHeader
				title="Editor Configuration"
				subtitle="Change your editor settings"
			/>
			<Divider />
			<form onSubmit={handleSubmit(saveConfig)}>
				<FormGroup>
					<FormControlLabel
						control={
							<Controller
								name="autoSave"
								control={control}
								defaultValue
								render={({ field }) => (
									<Switch
										checked={field.value}
										onChange={() => {
											field.onChange(!field.value);
										}}
										id="auto-save"
									/>
								)}
							/>
						}
						label="Autosave"
					/>
				</FormGroup>
				<Controller
					name="saveEveryNActions"
					control={control}
					render={({ field }) => (
						<TextField
							{...field}
							id="filled-number"
							label="Number"
							type="number"
							variant="filled"
						/>
					)}
				/>
				<Button type="submit">Save</Button>
			</form>
		</div>
	);
};

export default LanguageConfigPanel;
