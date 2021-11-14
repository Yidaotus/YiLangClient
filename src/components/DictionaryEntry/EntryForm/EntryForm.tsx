import './EntryForm.css';
import React from 'react';
import { IDictionaryEntry, IDictionaryTag } from 'Document/Dictionary';
import { FormInstance, RuleObject } from 'antd/lib/form';
import DictionarySelect from '@components/DictionaryEntry/DictionarySelect/DictionarySelect';
import YiTagsInput from '@components/DictionaryEntry/YiTagsInput/YiTagsInput';
import { Controller, UseFormMethods } from 'react-hook-form';
import { Divider, InputGroup, Label, TagInput } from '@blueprintjs/core';
import { MultiSelect } from '@blueprintjs/select';

export type IDictionaryEntryInput = Omit<
	IDictionaryEntry,
	'firstSeen' | 'id' | 'tags' | 'root'
> & {
	id?: string;
	tags: Array<IDictionaryTag | string>;
	root: string | IEntryFormFields;
};
export type IEntryFormFields = IDictionaryEntryInput;
export interface IEntryFormProps {
	form: UseFormMethods<IDictionaryEntryInput>;
	createTag?: (tagName: string) => IDictionaryTag;
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
			<form className="word-root-form">
				<input hidden {...form.register('id')} />
				<Controller
					name="key"
					control={form.control}
					defaultValue=""
					render={({ value, onChange }) => (
						<InputGroup
							onChange={onChange}
							placeholder="Key"
							value={value}
							fill
							disabled={!canEditRoot}
						/>
					)}
				/>
				<Controller
					name="spelling"
					control={form.control}
					defaultValue=""
					render={({ value, onChange }) => (
						<InputGroup
							onChange={onChange}
							placeholder="Spelling"
							fill
							value={value}
						/>
					)}
				/>
				<Controller
					name="translations"
					control={form.control}
					defaultValue={[]}
					render={({ value, onChange }) => (
						<TagInput
							fill
							values={value}
							onChange={onChange}
							placeholder="Translation(s)"
						/>
					)}
				/>
				<Controller
					name="comment"
					control={form.control}
					defaultValue=""
					render={({ value, onChange }) => (
						<InputGroup
							onChange={onChange}
							placeholder="Comment"
							value={value}
							fill
						/>
					)}
				/>
				<Controller
					name="tags"
					control={form.control}
					defaultValue={[]}
					render={({ value, onChange }) => (
						<YiTagsInput
							createTag={createTag}
							allTags={allTags}
							values={value}
							onSelectTag={(tag) => {
								onChange([...value, tag]);
							}}
							onRemoveTag={(tag) => {
								onChange(
									value.filter(
										(vTag: IDictionaryTag) =>
											vTag.id !== tag.id
									)
								);
							}}
						/>
					)}
				/>
				<Divider />
				{createRoot && (
					<Controller
						name="root"
						control={form.control}
						defaultValue=""
						render={({ value, onChange }) => (
							<DictionarySelect
								value={value}
								onChange={onChange}
								placeholder="Select a root entry"
								createRoot={createRoot}
							/>
						)}
					/>
				)}
			</form>
		</div>
	);
};

export default EntryForm;
