import './TagForm.css';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Form, Input, FormInstance, Button, Divider, Switch } from 'antd';
import { IDictionaryTag } from 'Document/Dictionary';
import React, { useCallback, useState } from 'react';
import YiColorPickerField from '@components/DictionaryEntry/YiColorPickerField/YiColorPickerField';

export type ITagFormFields = Omit<IDictionaryTag, 'id'>;

interface ITagFormProps {
	form: FormInstance<ITagFormFields>;
}

const INITIAL_FORM_VALUES: ITagFormFields = {
	lang: 'dft',
	name: '',
	color: '',
	grammarPoint: {
		construction: [''],
		description: '',
		name: '',
	},
};

const TagForm: React.FC<ITagFormProps> = ({ form }) => {
	const [showAddConstButton, setShowAddConstButton] = useState(false);
	const [hasGrammarPoint, setHasGrammarPoint] = useState(false);

	const updateShowConstButton = useCallback(() => {
		setShowAddConstButton(
			!!form
				.getFieldsValue()
				.grammarPoint?.construction.every((gp) => gp && gp.length > 0)
		);
	}, [form]);

	return (
		<Form
			form={form}
			layout="vertical"
			initialValues={INITIAL_FORM_VALUES}
			className="tag-input-form-container"
			onValuesChange={updateShowConstButton}
		>
			<Form.Item name="lang" hidden>
				<Input />
			</Form.Item>
			<Form.Item>
				<Form.Item
					name="name"
					style={{
						display: 'inline-block',
						width: 'calc(100% - 74px)',
					}}
				>
					<Input autoComplete="off" placeholder="Name" allowClear />
				</Form.Item>
				<span
					style={{
						display: 'inline-block',
						width: '24px',
						lineHeight: '32px',
						textAlign: 'center',
					}}
				/>
				<Form.Item
					name="color"
					style={{
						display: 'inline-block',
						width: '24px',
					}}
				>
					<YiColorPickerField />
				</Form.Item>
			</Form.Item>
			<Divider>
				<Switch
					checkedChildren="With Grammarpoint"
					unCheckedChildren="Without Grammarpoint"
					onChange={setHasGrammarPoint}
					checked={hasGrammarPoint}
				/>
			</Divider>
			<Form.Item
				name={['grammarPoint', 'name']}
				rules={[
					{
						required: hasGrammarPoint,
						message: 'Please input a name for this rule!',
					},
				]}
			>
				<Input
					autoComplete="off"
					placeholder="Name"
					allowClear
					disabled={!hasGrammarPoint}
				/>
			</Form.Item>
			<Form.Item name={['grammarPoint', 'description']}>
				<Input.TextArea
					placeholder="Description"
					allowClear
					disabled={!hasGrammarPoint}
				/>
			</Form.Item>
			<Form.List name={['grammarPoint', 'construction']}>
				{(fields, { add, remove }) => (
					<div>
						{fields.map((field) => (
							<div
								key={field.key}
								className={
									fields.length > 1
										? 'removable-constructor'
										: 'single-constructor'
								}
							>
								<Form.Item {...field}>
									<Input
										placeholder="Constructor"
										disabled={!hasGrammarPoint}
									/>
								</Form.Item>
								{fields.length > 1 ? (
									<MinusCircleOutlined
										onClick={() => {
											remove(field.name);
										}}
									/>
								) : null}
							</div>
						))}
						{hasGrammarPoint && showAddConstButton && (
							<Form.Item>
								<Button
									type="dashed"
									onClick={() => {
										add();
									}}
									style={{
										width: '100%',
									}}
									icon={<PlusOutlined />}
								>
									Add Constructor
								</Button>
							</Form.Item>
						)}
					</div>
				)}
			</Form.List>
		</Form>
	);
};

export default TagForm;
