import './EntryForm.css';
import React from 'react';
import { IDictionaryEntry, IDictionaryTag } from 'Document/Dictionary';
import DictionarySelect from '@components/DictionaryEntry/DictionarySelect/DictionarySelect';
import YiTagsInput from '@components/DictionaryEntry/YiTagsInput/YiTagsInput';
import { Controller, UseFormMethods } from 'react-hook-form';
import { Divider, InputGroup, Label, TagInput } from '@blueprintjs/core';
import { IDictionaryTagInput } from '@components/DictionaryEntry/TagForm/TagForm';

export type IDictionaryEntryInput = Omit<
	IDictionaryEntry,
	'firstSeen' | 'id' | 'tags' | 'root' | 'lang'
> & {
	tags: Array<IDictionaryTag | Omit<IDictionaryTag, 'id'>>;
	root?: IDictionaryEntry | IDictionaryEntryInput;
};

export interface IEntryFormProps {
	form: UseFormMethods<IDictionaryEntryInput>;
	createTag?: (tagName: string) => void;
	createRoot?: (key: string) => void;
	allTags: Array<Omit<IDictionaryTag, 'id'> & { id?: string }>;
	canEditRoot?: boolean;
}

const EntryForm: React.FC<IEntryFormProps> = ({
	form,
	createTag,
	createRoot,
	allTags,
	canEditRoot,
}) => {
	return (
		<div>
			<form className="word-form">
				<input hidden defaultValue="" {...form.register('id')} />
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
							large
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
							separator=";"
							addOnPaste
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
