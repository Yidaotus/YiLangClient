import './EntryForm.css';
import React from 'react';
import { Divider, Form, Input } from 'antd';
import { IDictionaryTag } from 'Document/Dictionary';
import { FormInstance, RuleObject } from 'antd/lib/form';
import DictionarySelect from '@components/DictionaryEntry/DictionarySelect/DictionarySelect';
import YiSelect from '@components/DictionaryEntry/YiSelect';
import YiTagsInput from '@components/DictionaryEntry/YiTagsInput/YiTagsInput';
import { IDictionaryEntryInput } from '@store/dictionary/actions';

export type IEntryFormFields = IDictionaryEntryInput;
export interface IEntryFormProps {
	form: FormInstance<IEntryFormFields>;
	createTag?: (tagName: string) => void;
	createRoot?: (key: string) => void;
	allTags: Array<IDictionaryTag>;
	canEditRoot?: boolean;
}

const arrayLengthValidator =
	(size: number) => (_: RuleObject, value: Array<string>) => {
		if (value && value.length >= size) {
			return Promise.resolve();
		}
		return Promise.reject(
			new Error(
				`Please enter at least ${size} value${size > 1 ? 's' : ''}!`
			)
		);
	};

const EntryForm: React.FC<IEntryFormProps> = ({
	form,
	createTag,
	createRoot,
	allTags,
	canEditRoot,
}) => {
	return (
		<div>
			<Form form={form} layout="vertical" className="word-root-form">
				<Form.Item name="id" hidden>
					<Input />
				</Form.Item>
				<Form.Item name="key" className="key">
					<Input
						className="key-autocomplete"
						autoFocus
						disabled={!canEditRoot}
						allowClear
						placeholder="Entry"
					/>
				</Form.Item>
				<Form.Item name="spelling">
					<Input
						autoComplete="off"
						placeholder="Spelling"
						allowClear
					/>
				</Form.Item>
				<Form.Item
					name="translations"
					rules={[
						{
							required: true,
							message: '',
							type: 'array',
						},
						{
							validator: arrayLengthValidator(1),
						},
					]}
					required
				>
					<YiSelect
						mode="tags"
						placeholder="Translation(s)"
						allowClear
						notFoundContent=""
					/>
				</Form.Item>
				<Form.Item name="comment">
					<Input
						autoComplete="off"
						placeholder="Comment"
						allowClear
					/>
				</Form.Item>
				<Form.Item name="tags" initialValue={[]}>
					<YiTagsInput createTag={createTag} allTags={allTags} />
				</Form.Item>
				<Divider />
				<Form.Item name="root">
					<DictionarySelect
						placeholder="Select a root entry"
						createRoot={createRoot}
					/>
				</Form.Item>
			</Form>
		</div>
	);
};

export default EntryForm;
