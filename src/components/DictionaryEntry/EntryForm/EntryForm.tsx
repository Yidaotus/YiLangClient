import './EntryForm.css';
import React from 'react';
import { IDictionaryEntry, IDictionaryTag } from 'Document/Dictionary';
import DictionarySelect from '@components/DictionaryEntry/DictionarySelect/DictionarySelect';
import YiTagsInput from '@components/DictionaryEntry/YiTagsInput/YiTagsInput';
import { Controller, UseFormReturn } from 'react-hook-form';
import { Divider, InputGroup, TagInput } from '@blueprintjs/core';
import { DictionaryEntryID } from 'Document/Utility';
import { IDictionaryTagInput } from '../TagForm/TagForm';

// react-hook-form v7 does not allow circular references so
// we need to abstract an additional rootsinput type
export type IRootsInput = Omit<
	IDictionaryEntry,
	'firstSeen' | 'id' | 'tags' | 'roots' | 'lang'
> & {
	tags: Array<IDictionaryTag | IDictionaryTagInput>;
	roots: [];
};

export type IDictionaryEntryInput = Omit<
	IDictionaryEntry,
	'firstSeen' | 'id' | 'tags' | 'roots' | 'lang'
> & {
	id?: string;
	tags: Array<IDictionaryTag | IDictionaryTagInput>;
	roots: Array<IDictionaryEntry | IRootsInput>;
};

export interface IEntryFormProps {
	form: UseFormReturn<IDictionaryEntryInput>;
	createTag?: (tagName: string) => void;
	createRoot?: (key: string) => void;
	canEditRoot?: boolean;
}

const EntryForm: React.FC<IEntryFormProps> = ({
	form,
	createTag,
	createRoot,
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
					render={({ field }) => (
						<InputGroup
							placeholder="Key"
							fill
							disabled={!canEditRoot}
							large
							{...field}
						/>
					)}
				/>
				<Controller
					name="spelling"
					control={form.control}
					defaultValue=""
					render={({ field }) => (
						<InputGroup placeholder="Spelling" fill {...field} />
					)}
				/>
				{!!form.formState.errors.translations && (
					<span className="form-error-label">
						At least one translation is required
					</span>
				)}
				<Controller
					name="translations"
					control={form.control}
					rules={{
						required: true,
						minLength: 1,
						validate: (translations: Array<string>) =>
							translations.length > 0 || 'Error!',
					}}
					defaultValue={[]}
					render={({ field }) => (
						<TagInput
							fill
							intent={
								form.formState.errors.translations
									? 'danger'
									: 'none'
							}
							placeholder="Translation(s)"
							separator=";"
							addOnPaste
							addOnBlur
							{...field}
						/>
					)}
				/>
				<Controller
					name="comment"
					control={form.control}
					defaultValue={form.getValues().comment || ''}
					render={({ field }) => (
						<InputGroup placeholder="Comment" fill {...field} />
					)}
				/>
				<Controller
					name="tags"
					control={form.control}
					defaultValue={[]}
					render={({ field }) => (
						<YiTagsInput
							createTag={createTag}
							values={
								field.value as IDictionaryEntryInput['tags']
							}
							onSelectTag={(tag) => {
								field.onChange([...field.value, tag]);
							}}
							onRemoveTag={(tag) => {
								const index = field.value.indexOf(tag);
								field.onChange(
									field.value.filter(
										(_, itemIndex) => index !== itemIndex
									)
								);
							}}
						/>
					)}
				/>
				<Divider />
				{createRoot && (
					<Controller
						name="roots"
						control={form.control}
						defaultValue={[]}
						render={({ field }) => (
							<DictionarySelect
								values={
									// react hook form seems to be unable to resolve
									// tagged types
									field.value as IDictionaryEntryInput['roots']
								}
								onSelectRoot={(newRoot) => {
									field.onChange([...field.value, newRoot]);
								}}
								onRemoveRoot={(root) => {
									const index = field.value.indexOf(root);
									field.onChange(
										field.value.filter(
											(_, itemIndex) =>
												index !== itemIndex
										)
									);
								}}
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
