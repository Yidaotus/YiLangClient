import './EntryForm.css';
import React from 'react';
import { IDictionaryEntry, IDictionaryTag } from 'Document/Dictionary';
import DictionarySelect from '@components/DictionaryEntry/DictionarySelect/DictionarySelect';
import TagSelect from '@components/DictionaryEntry/TagSelect/TagSelect';
import { Chip, Autocomplete, TextField, Stack } from '@mui/material';
import { Controller, UseFormReturn } from 'react-hook-form';
import * as Yup from 'yup';
import { IDictionaryTagInput } from '../TagForm/TagForm';

const INITIAL_ROOT_FORM: IRootsInput = {
	key: '',
	comment: '',
	tags: [],
	translations: [],
	roots: [],
};

const INITIAL_ENTRY_FORM: IDictionaryEntryInput = {
	key: '',
	comment: '',
	tags: [],
	translations: [],
	roots: [],
};

// react-hook-form v7 can't handle branded types so we need to create a plain
// string version for these types. I don't want to loose the branding in
// the rest of the code, so a new type is the only solution right now
export type IDictionaryTagInForm = Omit<IDictionaryTag, 'id'> & { id: string };
export type IDictionaryEntryInForm = Omit<
	IDictionaryEntry,
	'firstSeen' | 'id' | 'tags' | 'roots' | 'lang' | 'createdAt'
> & { id: string; roots: Array<string>; tags: Array<string> };

// react-hook-form v7 does not allow circular references so
// we need to abstract an additional rootsinput type
export type IRootsInput = Omit<
	IDictionaryEntry,
	'firstSeen' | 'id' | 'tags' | 'roots' | 'lang' | 'createdAt'
> & {
	tags: Array<IDictionaryTagInForm | IDictionaryTagInput>;
	roots: [];
};

export type IDictionaryEntryInput = Omit<
	IDictionaryEntry,
	'firstSeen' | 'id' | 'tags' | 'roots' | 'lang' | 'createdAt'
> & {
	id?: string;
	tags: Array<IDictionaryTagInForm | IDictionaryTagInput>;
	roots: Array<IDictionaryEntryInForm | IRootsInput>;
};

export interface IEntryFormProps {
	form: UseFormReturn<IDictionaryEntryInput>;
	createTag: (tagName: string) => void;
	createRoot?: (key: string) => void;
	canEditRoot?: boolean;
}

const entrySchema = Yup.object({
	key: Yup.string().required('A valid key is required!'),
	translations: Yup.array(Yup.string())
		.min(1, 'Please enter at least one translation')
		.required('Translation(s) are required'),
});

const EntryForm: React.FC<IEntryFormProps> = ({
	form,
	createTag,
	createRoot,
	canEditRoot,
}) => {
	const {
		formState: { isSubmitting },
	} = form;
	return (
		<div>
			<form noValidate>
				<Stack spacing={2}>
					<input hidden defaultValue="" {...form.register('id')} />
					<Controller
						name="key"
						control={form.control}
						defaultValue=""
						render={({ field, fieldState: { error } }) => (
							<TextField
								{...field}
								error={!!error}
								disabled
								variant="outlined"
								helperText={error?.message || null}
								label="Key"
								placeholder="Key"
							/>
						)}
					/>

					<Controller
						name="translations"
						control={form.control}
						defaultValue={[]}
						render={({ field, fieldState: { error } }) => (
							<Autocomplete
								{...field}
								multiple
								options={[] as Array<string>}
								disabled={isSubmitting}
								freeSolo
								renderTags={(value, getTagProps) =>
									value.map(
										(option: string, index: number) => (
											<Chip
												variant="outlined"
												label={option}
												{...getTagProps({ index })}
											/>
										)
									)
								}
								renderInput={(params) => (
									<TextField
										{...params}
										variant="outlined"
										error={!!error}
										label="Translation(s)"
										helperText={error?.message || null}
										placeholder="Translation(s)"
									/>
								)}
								onChange={(_, data) => field.onChange(data)}
							/>
						)}
					/>

					<Controller
						name="spelling"
						control={form.control}
						defaultValue=""
						render={({ field, fieldState: { error } }) => (
							<TextField
								{...field}
								variant="outlined"
								disabled={isSubmitting}
								error={!!error}
								helperText={error?.message || null}
								label="Spelling"
								placeholder="Spelling"
								autoComplete="off"
							/>
						)}
					/>

					<Controller
						name="comment"
						control={form.control}
						defaultValue=""
						render={({ field, fieldState: { error } }) => (
							<TextField
								{...field}
								variant="outlined"
								error={!!error}
								helperText={error?.message || null}
								label="Comment"
								placeholder="Comment"
								autoComplete="off"
							/>
						)}
					/>

					<Controller
						name="tags"
						control={form.control}
						defaultValue={[]}
						render={({ field }) => (
							<TagSelect
								value={
									field.value as IDictionaryEntryInput['tags']
								}
								onChange={(newValue) => {
									field.onChange(newValue);
								}}
								placeholder="Tags"
								create={createTag}
							/>
						)}
					/>

					{createRoot && (
						<Controller
							name="roots"
							control={form.control}
							defaultValue={[]}
							render={({ field }) => (
								<DictionarySelect
									value={
										// react hook form seems to be unable to resolve
										// tagged types
										field.value as IDictionaryEntryInput['roots']
									}
									onChange={(newValue) => {
										field.onChange(newValue);
									}}
									placeholder="Root entries"
									createRoot={createRoot}
								/>
							)}
						/>
					)}
				</Stack>
			</form>
		</div>
	);
};

export default EntryForm;
export { INITIAL_ENTRY_FORM, INITIAL_ROOT_FORM, entrySchema };
