import './EditorConfig.css';
import { IEditorConfig } from 'Document/Config';
import React, { useEffect } from 'react';
import {
	Divider,
	Colors,
	Switch,
	NumericInput,
	Button,
	FormGroup,
	Label,
	Intent,
} from '@blueprintjs/core';
import {
	useEditorConfig,
	useUpdateEditorConfig,
} from '@hooks/ConfigQueryHooks';
import { SubmitHandler, useForm, Controller } from 'react-hook-form';

const LanguageConfigPanel: React.FC = () => {
	const currentConfig = useEditorConfig();
	const updateEditorConfig = useUpdateEditorConfig();
	const { control, handleSubmit, reset, setValue } = useForm<IEditorConfig>({
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
		<div className="sub-header">
			<h2 className="bp3-heading">Editor Configuration</h2>
			<h3 className="bp3-heading" style={{ color: Colors.DARK_GRAY5 }}>
				Change your editor settings
			</h3>
			<Divider />
			<form onSubmit={handleSubmit(saveConfig)}>
				<Controller
					name="autoSave"
					control={control}
					defaultValue=""
					render={({ value, onChange }) => (
						<Switch
							value={value}
							onChange={onChange}
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
