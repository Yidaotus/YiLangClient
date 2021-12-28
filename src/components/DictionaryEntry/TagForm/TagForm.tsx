import './TagForm.css';
import { IDictionaryTag, IGrammarPoint } from 'Document/Dictionary';
import React, { useCallback, useState } from 'react';
import YiColorPickerField from '@components/DictionaryEntry/YiColorPickerField/YiColorPickerField';
import { Add, Remove } from '@mui/icons-material';
import { Controller, useFieldArray, UseFormReturn } from 'react-hook-form';
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
	grammarPoint: RHFGrammarPoint;
};

interface ITagFormProps {
	form: UseFormReturn<IDictionaryTagInput>;
}

export const INITIAL_TAG_FORM_VALUES: IDictionaryTagInput = {
	name: '',
	color: '',
	grammarPoint: {
		construction: [{ point: '' }],
		description: '',
		name: '',
	},
};

const TagForm: React.FC<ITagFormProps> = ({ form }) => {
	const [showAddConstButton, setShowAddConstButton] = useState(false);
	const [hasGrammarPoint, setHasGrammarPoint] = useState(false);

	const updateShowConstButton = useCallback(() => {
		const formValues = form.getValues();
		let showAddButton = true;
		if (formValues.grammarPoint.construction) {
			showAddButton = !!formValues.grammarPoint.construction.every(
				(gp) => gp && gp.point.length > 0
			);
		}
		setShowAddConstButton(showAddButton);
	}, [form]);

	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: 'grammarPoint.construction',
	});

	return (
		<form
			className="tag-input-form-container"
			onChange={updateShowConstButton}
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
					<Box sx={{ flexGrow: 1 }}>
						<Controller
							name="name"
							control={form.control}
							defaultValue=""
							rules={{ required: true, minLength: 1 }}
							render={({ field }) => (
								<TextField
									{...field}
									fullWidth
									placeholder="name"
								/>
							)}
						/>
					</Box>
					<Controller
						name="color"
						control={form.control}
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
					control={form.control}
					render={({ field }) => (
						<TextField
							{...field}
							placeholder="Name"
							fullWidth
							disabled={!hasGrammarPoint}
						/>
					)}
				/>
				<Controller
					name="grammarPoint.description"
					defaultValue=""
					control={form.control}
					render={({ field }) => (
						<TextField
							placeholder="Desc"
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
										control={form.control}
										render={(subField) => (
											<TextField
												{...subField.field}
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
		</form>
	);
};

export default TagForm;
