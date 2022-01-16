import React, { useEffect } from 'react';
import {
	IDictionaryEntry,
	IDictionaryEntryResolved,
	IDictionaryTag,
} from 'Document/Dictionary';
import DictionarySelect from '@components/DictionaryEntry/DictionarySelect/DictionarySelect';
import TagSelect from '@components/DictionaryEntry/TagSelect/TagSelect';
import { TextField, Stack, Button } from '@mui/material';
import { Controller } from 'react-hook-form';
import * as Yup from 'yup';
import { ITagFormOutput } from '../TagForm/TagForm';
import TagInput from '../TagInput';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { DictionaryEntryID } from 'Document/Utility';
import { IRootFormOutput } from '../RootForm/RootForm';

export type IDictionaryEntryInput = Omit<
	IDictionaryEntry,
	'firstSeen' | 'id' | 'tags' | 'roots' | 'lang' | 'createdAt'
> & {
	id?: DictionaryEntryID;
	tags: Array<IDictionaryTag | ITagFormOutput>;
	roots: Array<IDictionaryEntry | IRootFormOutput>;
};
export type IEntryFormDefaults = Partial<IDictionaryEntryResolved>;
export type IEntryFormOutput = Omit<
	IDictionaryEntry,
	'firstSeen' | 'id' | 'tags' | 'roots' | 'lang' | 'createdAt'
> & {
	id?: DictionaryEntryID;
	tags: Array<IDictionaryTag | ITagFormOutput>;
	roots: Array<IDictionaryEntry | IRootFormOutput>;
};

export interface IEntryFormProps {
	createTag: (tagName: string, formState: IDictionaryEntryInput) => void;
	createRoot: (key: string, formState: IDictionaryEntryInput) => void;
	onSubmit: (entry: IEntryFormOutput) => void;
	onCancel: () => void;
	submitLabel: string | React.ReactElement;
	cancelLabel: string | React.ReactElement;
	defaultValues?: IEntryFormDefaults;
	formState?: IDictionaryEntryInput;
}

const entrySchema = Yup.object({
	key: Yup.string().required('A valid key is required!'),
	translations: Yup.array(Yup.string())
		.min(1, 'Please enter at least one translation')
		.required('Translation(s) are required'),
});

const INITIAL_ENTRY_FORM_VALUES: IDictionaryEntryInput = {
	key: '',
	comment: '',
	tags: [],
	translations: [],
	roots: [],
};

const EntryForm: React.FC<IEntryFormProps> = ({
	createTag,
	createRoot,
	onSubmit,
	onCancel,
	submitLabel,
	cancelLabel,
	defaultValues,
	formState,
}) => {
	const {
		control,
		register,
		handleSubmit,
		getValues,
		reset,
		formState: { isSubmitting },
	} = useForm<IDictionaryEntryInput>({
		resolver: yupResolver(entrySchema),
		reValidateMode: 'onChange',
		defaultValues: defaultValues || INITIAL_ENTRY_FORM_VALUES,
	});

	useEffect(() => {
		if (formState) {
			reset(formState);
		}
	}, [formState, reset]);

	const createTagCB = (tagName: string) => {
		const currentFormState = getValues();
		createTag(tagName, currentFormState);
	};

	const createRootCB = (rootKey: string) => {
		const currentFormState = getValues();
		createRoot(rootKey, currentFormState);
	};

	return (
		<div>
			<form onSubmit={handleSubmit(onSubmit)}>
				<Stack spacing={2}>
					<input hidden defaultValue="" {...register('id')} />
					<Controller
						name="key"
						control={control}
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
						control={control}
						defaultValue={[]}
						render={({ field, fieldState: { error } }) => (
							<TagInput
								value={field.value}
								onChange={field.onChange}
								disabled={isSubmitting}
								error={error?.message || undefined}
								label="Translation(s)"
								placeholder="Translation(s)"
							/>
						)}
					/>

					<Controller
						name="spelling"
						control={control}
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
						control={control}
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
						control={control}
						defaultValue={[]}
						render={({ field }) => (
							<TagSelect
								value={field.value}
								onChange={(newValue) => {
									field.onChange(newValue);
								}}
								placeholder="Tags"
								create={createTagCB}
							/>
						)}
					/>

					<Controller
						name="roots"
						control={control}
						defaultValue={[]}
						render={({ field }) => (
							<DictionarySelect
								value={field.value}
								onChange={(newValue) => {
									field.onChange(newValue);
								}}
								placeholder="Root entries"
								createRoot={createRootCB}
							/>
						)}
					/>
				</Stack>
				<Stack
					direction="row"
					sx={{ justifyContent: 'space-between', mt: 1 }}
				>
					<Button onClick={onCancel}>{cancelLabel}</Button>
					<Button variant="contained" type="submit">
						{submitLabel}
					</Button>
				</Stack>
			</form>
		</div>
	);
};

export default EntryForm;
export { INITIAL_ENTRY_FORM_VALUES };
