import React, { useEffect } from 'react';
import {
	IDictionaryEntry,
	IDictionaryEntryResolved,
	IDictionaryTag,
} from 'Document/Dictionary';
import TagSelect from '@components/DictionaryEntry/TagSelect/TagSelect';
import { TextField, Stack, Button } from '@mui/material';
import { Controller } from 'react-hook-form';
import * as Yup from 'yup';
import { ITagFormOutput } from '../TagForm/TagForm';
import TagInput from '../TagInput';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

export type IDictionaryRootInput = Omit<
	IDictionaryEntry,
	'firstSeen' | 'id' | 'tags' | 'roots' | 'lang' | 'createdAt'
> & {
	tags: Array<IDictionaryTag | ITagFormOutput>;
};
export type IRootFormDefaults = Partial<IDictionaryEntryResolved>;
export type IRootFormOutput = IDictionaryRootInput;

export interface IRootFormProps {
	createTag: (tagName: string, formState: IDictionaryRootInput) => void;
	onSubmit: (entry: IRootFormOutput) => void;
	onCancel: () => void;
	submitLabel: string | React.ReactElement;
	cancelLabel: string | React.ReactElement;
	defaultValues?: IRootFormDefaults;
	formState?: IDictionaryRootInput;
}

const entrySchema = Yup.object({
	key: Yup.string().required('A valid key is required!'),
	translations: Yup.array(Yup.string())
		.min(1, 'Please enter at least one translation')
		.required('Translation(s) are required'),
});

const INITIAL_ROOT_FORM_VALUES: IDictionaryRootInput = {
	key: '',
	comment: '',
	tags: [],
	translations: [],
};

const EntryForm: React.FC<IRootFormProps> = ({
	createTag,
	onSubmit,
	onCancel,
	submitLabel,
	cancelLabel,
	defaultValues,
	formState,
}) => {
	const {
		control,
		handleSubmit,
		getValues,
		reset,
		formState: { isSubmitting },
	} = useForm<IDictionaryRootInput>({
		resolver: yupResolver(entrySchema),
		reValidateMode: 'onChange',
		defaultValues: defaultValues || INITIAL_ROOT_FORM_VALUES,
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

	return (
		<div>
			<form onSubmit={handleSubmit(onSubmit)}>
				<Stack spacing={2}>
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
export { INITIAL_ROOT_FORM_VALUES };
