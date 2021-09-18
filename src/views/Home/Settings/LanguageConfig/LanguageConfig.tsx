import './LanguageConfig.css';
import {
	DeleteOutlined,
	EditOutlined,
	ExclamationCircleOutlined,
} from '@ant-design/icons';
import InnerModal from '@components/InnerModal/InnerModal';
import LangConfForm from '@components/Settings/LangConfForm/LangConfForm';
import { IRootDispatch } from '@store/index';
import {
	updateLanguageConfig,
	addLanguageConfig,
	removeLanguageConfig,
} from '@store/user/actions';
import { selectAvailableLanguageConfigs } from '@store/user/selectors';
import { Card, Button, Form, Modal, List, PageHeader } from 'antd';
import { ILanguageConfig } from 'Document/Config';
import { UUID } from 'Document/UUID';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const { confirm } = Modal;

const LanguageConfig: React.FC = () => {
	const availableLanguages = useSelector(selectAvailableLanguageConfigs);
	const [addFormVisible, setAddFormVisible] = useState(false);

	const dispatch: IRootDispatch = useDispatch();
	const [langConfForm] = Form.useForm<ILanguageConfig>();

	const saveConfig = (entry: ILanguageConfig) => {
		if (entry.key) {
			dispatch(updateLanguageConfig(entry));
		} else {
			dispatch(addLanguageConfig(entry));
		}
		langConfForm.resetFields();
		setAddFormVisible(false);
	};

	const removeConfig = (key: UUID) => {
		confirm({
			title: 'Are you sure delete this language?',
			icon: <ExclamationCircleOutlined />,
			content: 'Deleted languages can not be recovered!',
			okText: 'Yes',
			okType: 'danger',
			cancelText: 'No',
			onOk() {
				dispatch(removeLanguageConfig(key));
			},
		});
	};

	const editConfig = (key: UUID) => {
		const selectedLanguage = availableLanguages.find(
			(lang) => lang.key === key
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
					width="700px"
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
								onClick={() => editConfig(language.key)}
							/>,
							<Button
								icon={<DeleteOutlined />}
								danger
								type="link"
								onClick={() => removeConfig(language.key)}
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
