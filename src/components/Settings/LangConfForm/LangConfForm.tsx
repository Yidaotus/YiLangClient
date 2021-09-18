import './LangConfForm.css';
import {
	InfoCircleOutlined,
	MinusCircleOutlined,
	PlusOutlined,
} from '@ant-design/icons';
import {
	Button,
	Divider,
	Form,
	FormInstance,
	Input,
	Space,
	Tooltip,
} from 'antd';
import { ILanguageConfig } from 'Document/Config';
import React from 'react';

interface ILangFormProps {
	form: FormInstance<ILanguageConfig>;
}

const LangConfForm: React.FC<ILangFormProps> = ({ form }) => {
	return (
		<Form
			form={form}
			layout="vertical"
			className="tag-input-form-container"
		>
			<h3>Name</h3>
			<Form.Item name="key" hidden>
				<Input />
			</Form.Item>
			<Form.Item name="name">
				<Input placeholder="Language name" />
			</Form.Item>
			<Divider />
			<Space align="baseline">
				<h3>Lookup Sources</h3>
				<Tooltip
					placement="bottom"
					title='
						To create a lookup source enter a name and the URL for
						the source. Important: replace the search string with
						"&#123;&#125;". YiLang will substitude
						"&#123;&#125;" with the given search string.'
				>
					<InfoCircleOutlined />
				</Tooltip>
			</Space>
			<Form.List name="lookupSources">
				{(fields, { add, remove }) => (
					<>
						{fields.map(({ key, name, fieldKey, ...restField }) => (
							<div className="source-sub-form" key={key}>
								<Form.Item
									{...restField}
									name={[name, 'name']}
									fieldKey={[fieldKey, 'name']}
									rules={[
										{
											required: true,
											message: 'Missing name',
										},
									]}
								>
									<Input placeholder="Name" />
								</Form.Item>
								<Form.Item
									{...restField}
									name={[name, 'source']}
									fieldKey={[fieldKey, 'source']}
									rules={[
										{
											required: true,
											message: 'Missing source',
										},
										{
											pattern: new RegExp('{}'),
											message:
												'Source must contain the {} placeholder',
										},
									]}
									style={{ flexGrow: 1 }}
								>
									<Input placeholder="Source" />
								</Form.Item>
								<MinusCircleOutlined
									onClick={() => remove(name)}
								/>
							</div>
						))}
						<Form.Item>
							<Button
								type="dashed"
								onClick={() => add()}
								block
								icon={<PlusOutlined />}
							>
								Add Source
							</Button>
						</Form.Item>
					</>
				)}
			</Form.List>
		</Form>
	);
};

export default LangConfForm;
