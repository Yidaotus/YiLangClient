import './LanguageConfig.css';
import {
	DeleteOutlined,
	EditOutlined,
	ExclamationCircleOutlined,
} from '@ant-design/icons';
import InnerModal from '@components/InnerModal/InnerModal';
import LangConfForm from '@components/Settings/LangConfForm/LangConfForm';
import { Card, Button, Form, Modal, List, PageHeader } from 'antd';
import { ILanguageConfig } from 'Document/Config';
import React, { useState } from 'react';
import {
	useAddLanguageConfig,
	useLanguageConfigs,
	useRemoveLanguageConfig,
	useUpdateLanguageConfig,
} from '@hooks/ConfigQueryHooks';

const { confirm } = Modal;

const LanguageConfig: React.FC = () => {
	const availableLanguages = useLanguageConfigs();
	const [addFormVisible, setAddFormVisible] = useState(false);

	const [langConfForm] = Form.useForm<ILanguageConfig>();
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
		langConfForm.resetFields();
		setAddFormVisible(false);
	};

	const removeConfig = (id: string) => {
		confirm({
			title: 'Are you sure delete this language?',
			icon: <ExclamationCircleOutlined />,
			content: 'Deleted languages can not be recovered!',
			okText: 'Yes',
			okType: 'danger',
			cancelText: 'No',
			onOk() {
				removeLanguageConfig.mutate(id);
			},
		});
	};

	const editConfig = (key: string) => {
		const selectedLanguage = availableLanguages.find(
			(lang) => lang.id === key
		);
		if (selectedLanguage) {
			langConfForm.setFieldsValue(selectedLanguage);
			setAddFormVisible(true);
		}
	};

	return (
		<PageHeader
			className="sub-header"
			title="Language Configurations"
			subTitle="Change your language settings"
			ghost={false}
			extra={
				<Button type="primary" onClick={() => setAddFormVisible(true)}>
					Add language
				</Button>
			}
		>
			{addFormVisible && (
				<InnerModal
					onClose={() => {
						setAddFormVisible(false);
					}}
					width="600px"
				>
					<Card>
						<LangConfForm form={langConfForm} />
						<div className="add-form-actions">
							<Button
								onClick={async () => {
									const newConf =
										await langConfForm.validateFields();
									saveConfig(newConf);
								}}
								type="primary"
							>
								Save
							</Button>
							<Button
								onClick={() => {
									langConfForm.resetFields();
									setAddFormVisible(false);
								}}
								danger
								type="primary"
							>
								Cancel
							</Button>
						</div>
					</Card>
				</InnerModal>
			)}

			<List
				size="default"
				bordered
				dataSource={availableLanguages}
				renderItem={(language) => (
					<List.Item
						actions={[
							<Button
								icon={<EditOutlined />}
								type="link"
								onClick={() => editConfig(language.id)}
							/>,
							<Button
								icon={<DeleteOutlined />}
								danger
								type="link"
								onClick={() => removeConfig(language.id)}
							/>,
						]}
					>
						<List.Item.Meta
							title={language.name}
							description={language.lookupSources
								.map((luSource) => luSource.name)
								.join(', ')}
						/>
					</List.Item>
				)}
			/>
		</PageHeader>
	);
};

export default LanguageConfig;
