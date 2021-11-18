import './EditorConfig.css';
import { IEditorConfig } from 'Document/Config';
import React, { useEffect } from 'react';
import {
	Divider,
	Switch,
	NumericInput,
	Button,
	Label,
	Intent,
} from '@blueprintjs/core';
import {
	useEditorConfig,
	useUpdateEditorConfig,
} from '@hooks/ConfigQueryHooks';
import { useForm, Controller } from 'react-hook-form';
import PageHeader from '@components/PageHeader/PageHeader';

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
				<Controller
					name="autoSave"
					control={control}
					defaultValue
					render={({ value, onChange }) => (
						<Switch
							checked={value}
							onChange={() => {
								onChange(!value);
							}}
							large
							label="Auto save"
							id="auto-save"
						/>
					)}
				/>
				<Label>
					Save every N actions
					<Controller
						name="saveEveryNActions"
						control={control}
						render={({ value, onChange }) => (
							<NumericInput
								value={value}
								onValueChange={onChange}
								placeholder="Save every n actions"
							/>
						)}
					/>
				</Label>
				<Button type="submit" minimal intent={Intent.PRIMARY}>
					Save
				</Button>
			</form>
		</div>
	);
};

export default LanguageConfigPanel;
