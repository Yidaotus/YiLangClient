import './EditorConfig.css';
import { Form, PageHeader, Input, Button, Switch } from 'antd';
import { IEditorConfig } from 'Document/Config';
import React, { useEffect } from 'react';
import {
	useEditorConfig,
	useUpdateEditorConfig,
} from '@hooks/ConfigQueryHooks';

const LanguageConfig: React.FC = () => {
	const currentConfig = useEditorConfig();

	const [editorConfForm] = Form.useForm<IEditorConfig>();
	const updateEditorConfig = useUpdateEditorConfig();

	const saveConfig = (newConfig: IEditorConfig) => {
		const newConfigWithoutNullishValues = Object.fromEntries(
			Object.entries(newConfig).filter(([, v]) => v != null && v !== '')
		);
		if (Object.keys(newConfigWithoutNullishValues).length > 0) {
			updateEditorConfig.mutate({
				editorConfig: newConfigWithoutNullishValues,
			});
		}
		editorConfForm.resetFields();
	};

	useEffect(() => {
		editorConfForm.setFieldsValue({ ...currentConfig });
	}, [currentConfig, editorConfForm]);

	return (
		<PageHeader
			className="sub-header"
			title="Editor Configuration"
			subTitle="Change your editor settings"
			ghost={false}
		>
			<Form form={editorConfForm} layout="vertical" onFinish={saveConfig}>
				<Form.Item
					name="autoSave"
					label="Auto save"
					valuePropName="checked"
				>
					<Switch />
				</Form.Item>
				<Form.Item
					name="saveEveryNActions"
					label="Auto save every n actions"
				>
					<Input type="number" />
				</Form.Item>
				<Form.Item wrapperCol={{ offset: 8, span: 16 }}>
					<Button type="primary" htmlType="submit">
						Save
					</Button>
				</Form.Item>
			</Form>
		</PageHeader>
	);
};

export default LanguageConfig;
