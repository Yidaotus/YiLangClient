import { IDictionaryTag, IGrammarPoint } from 'Document/Dictionary';
import React, { useMemo, useState } from 'react';
import YiColorPickerField from '@components/DictionaryEntry/YiColorPickerField/YiColorPickerField';
import { Add, Remove } from '@mui/icons-material';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import {
	IconButton,
	Button,
	Switch,
	TextField,
	Stack,
	Box,
	FormGroup,
	FormControlLabel,
} from '@mui/material';
import { DictionaryTagID, Optional } from 'Document/Utility';

// This is the special type for the dynamic form input as
// react hook form does not support flat arrays we need to
// provide this in object shape.
// See https://react-hook-form.com/api/usefieldarray
type RHFGrammarPoint = Omit<IGrammarPoint, 'construction'> & {
	construction?: Array<{ point: string }>;
};

export type IDictionaryTagInput = Omit<
	IDictionaryTag,
	'id' | 'grammarPoint' | 'lang'
> & {
	id?: string;
	grammarPoint: RHFGrammarPoint;
};

export type ITagFormDefaults = Partial<IDictionaryTag>;
export type ITagFormOutput = Optional<Omit<IDictionaryTag, 'lang'>, 'id'>;

interface ITagFormProps {
	onSubmit: (newTag: ITagFormOutput) => void;
	onCancel: () => void;
	submitLabel: string | React.ReactElement;
	cancelLabel: string | React.ReactElement;
	defaultValues?: ITagFormDefaults;
}

const tagSchema = Yup.object({
	name: Yup.string().required('A valid name is required!'),
});

export const INITIAL_TAG_FORM_VALUES: IDictionaryTagInput = {
	name: '',
	color: '',
	grammarPoint: {
		construction: [{ point: '' }],
		description: '',
		name: '',
	},
};

const TagForm: React.FC<ITagFormProps> = ({
	onSubmit,
	onCancel,
	submitLabel,
	cancelLabel,
	defaultValues,
}) => {
	const formattedDefaultValues = useMemo(() => {
		if (!defaultValues) {
			return null;
		}
		const flattenedConstruction =
			defaultValues?.grammarPoint?.construction || [];
		const unflattenedConstructions = flattenedConstruction.map(
			(construction) => ({ point: construction })
		);
		return {
			...defaultValues,
			grammarPoint: {
				...defaultValues.grammarPoint,
				construction: unflattenedConstructions,
			},
		};
	}, [defaultValues]);

	const { handleSubmit, getValues, control, register } =
		useForm<IDictionaryTagInput>({
			defaultValues: formattedDefaultValues || INITIAL_TAG_FORM_VALUES,
			resolver: yupResolver(tagSchema),
		});
	const { fields, append, remove } = useFieldArray({
		control: control,
		name: 'grammarPoint.construction',
	});
	const [showAddConstButton, setShowAddConstButton] = useState(false);
	const [hasGrammarPoint, setHasGrammarPoint] = useState(false);

	const updateShowConstButton = () => {
		const formValues = getValues();
		let showAddButton = true;
		if (formValues.grammarPoint.construction) {
			showAddButton = !!formValues.grammarPoint.construction.every(
				(gp) => gp && gp.point.length > 0
			);
		}
		setShowAddConstButton(showAddButton);
	};

	const sanitizeFormData = (formTag: IDictionaryTagInput) => {
		const cleanedUpGrammarPoint: IGrammarPoint = {
			...formTag.grammarPoint,
			construction:
				formTag.grammarPoint.construction?.map((gmc) => gmc.point) ||
				[],
		};
		const result: ITagFormOutput = {
			...formTag,
			id: formTag.id ? (formTag.id as DictionaryTagID) : undefined,
			grammarPoint: cleanedUpGrammarPoint.name
				? cleanedUpGrammarPoint
				: undefined,
		};
		onSubmit(result);
	};

	return (
		<form
			className="tag-input-form-container"
			onChange={updateShowConstButton}
			onSubmit={handleSubmit(sanitizeFormData)}
		>
			<Stack spacing={2}>
				<Stack
					spacing={2}
					direction="row"
					alignItems="center"
					sx={{
						display: 'flex',
						width: '100%',
					}}
				>
					<input hidden defaultValue="" {...register('id')} />
					<Box sx={{ flexGrow: 1 }}>
						<Controller
							name="name"
							control={control}
							defaultValue=""
							render={({ field, fieldState: { error } }) => (
								<TextField
									{...field}
									error={!!error}
									helperText={error?.message || null}
									fullWidth
									placeholder="name"
								/>
							)}
						/>
					</Box>
					<Controller
						name="color"
						control={control}
						defaultValue=""
						render={({ field }) => (
							<YiColorPickerField {...field} />
						)}
					/>
				</Stack>
				<Box sx={{ alignSelf: 'center' }}>
					<FormGroup>
						<FormControlLabel
							control={
								<Switch
									onChange={(e) =>
										setHasGrammarPoint(
											e.currentTarget.checked
										)
									}
									checked={hasGrammarPoint}
								/>
							}
							label="Has Grammarpoint"
						/>
					</FormGroup>
				</Box>
				<Controller
					name="grammarPoint.name"
					defaultValue=""
					control={control}
					render={({ field, fieldState: { error } }) => (
						<TextField
							{...field}
							placeholder="Name"
							error={!!error}
							helperText={error?.message || null}
							fullWidth
							disabled={!hasGrammarPoint}
						/>
					)}
				/>
				<Controller
					name="grammarPoint.description"
					defaultValue=""
					control={control}
					render={({ field, fieldState: { error } }) => (
						<TextField
							placeholder="Desc"
							error={!!error}
							helperText={error?.message || null}
							fullWidth
							disabled={!hasGrammarPoint}
							{...field}
						/>
					)}
				/>
				{hasGrammarPoint &&
					fields.map((field, index) => (
						<div className="source-sub-form" key={field.id}>
							<Stack
								spacing={2}
								direction="row"
								alignItems="center"
								sx={{
									display: 'flex',
									width: '100%',
								}}
							>
								<Box sx={{ flexGrow: 1 }}>
									<Controller
										name={`grammarPoint.construction.${index}.point`}
										defaultValue={field.point}
										control={control}
										render={(subField) => (
											<TextField
												{...subField.field}
												error={
													!!subField.fieldState.error
												}
												helperText={
													subField.fieldState.error
														?.message || null
												}
												fullWidth
												placeholder="Point"
											/>
										)}
									/>
								</Box>
								<IconButton onClick={() => remove(index)}>
									<Remove />
								</IconButton>
							</Stack>
						</div>
					))}
				{hasGrammarPoint && showAddConstButton && (
					<Button
						onClick={() => {
							append({ point: '' });
						}}
						endIcon={<Add />}
						variant="contained"
					>
						Add Constructor
					</Button>
				)}
			</Stack>
			<Stack
				direction="row"
				sx={{ justifyContent: 'space-between', mt: 1 }}
			>
				<Button aria-label="cancel" onClick={onCancel}>
					{cancelLabel}
				</Button>
				<Button aria-label="save" variant="contained" type="submit">
					{submitLabel}
				</Button>
			</Stack>
		</form>
	);
};

export default TagForm;
