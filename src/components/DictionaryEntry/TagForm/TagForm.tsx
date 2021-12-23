import './TagForm.css';
import { IDictionaryTag, IGrammarPoint } from 'Document/Dictionary';
import React, { useCallback, useState } from 'react';
import YiColorPickerField from '@components/DictionaryEntry/YiColorPickerField/YiColorPickerField';
import { Controller, useFieldArray, UseFormReturn } from 'react-hook-form';
import { Button, InputGroup, Switch } from '@blueprintjs/core';
import { DictionaryTagID } from 'Document/Utility';

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
			<div className="tag-form-line">
				{!!form.formState.errors.name && (
					<span className="form-error-label">
						A name for the tag is required
					</span>
				)}
				<Controller
					name="name"
					control={form.control}
					defaultValue=""
					rules={{ required: true, minLength: 1 }}
					render={({ field }) => (
						<InputGroup placeholder="name" fill {...field} />
					)}
				/>
				<Controller
					name="color"
					control={form.control}
					defaultValue=""
					render={({ field }) => <YiColorPickerField {...field} />}
				/>
			</div>
			<div className="tag-form-line tag-form-center">
				<p className="bp3-ui-text bp3-running-text">
					Has Grammarpoint?
				</p>
				<Switch
					onChange={(e) =>
						setHasGrammarPoint(e.currentTarget.checked)
					}
					checked={hasGrammarPoint}
				/>
			</div>
			<div className="tag-form-line">
				<Controller
					name="grammarPoint.name"
					defaultValue=""
					control={form.control}
					render={({ field }) => (
						<InputGroup
							placeholder="Name"
							fill
							disabled={!hasGrammarPoint}
							{...field}
						/>
					)}
				/>
			</div>
			<div className="tag-form-line">
				<Controller
					name="grammarPoint.description"
					defaultValue=""
					control={form.control}
					render={({ field }) => (
						<InputGroup
							placeholder="Desc"
							fill
							disabled={!hasGrammarPoint}
							{...field}
						/>
					)}
				/>
			</div>
			{hasGrammarPoint &&
				fields.map((field, index) => (
					<div className="source-sub-form" key={field.id}>
						<Controller
							name={`grammarPoint.construction.${index}.point`}
							defaultValue={field.point}
							control={form.control}
							render={(subField) => (
								<InputGroup
									placeholder="Point"
									fill
									{...subField.field}
								/>
							)}
						/>
						<Button
							icon="minus"
							minimal
							onClick={() => remove(index)}
						/>
					</div>
				))}
			{hasGrammarPoint && showAddConstButton && (
				<div className="tag-form-line">
					<Button
						onClick={() => {
							append({ point: '' });
						}}
						style={{
							width: '100%',
						}}
						icon="plus"
					>
						Add Constructor
					</Button>
				</div>
			)}
		</form>
	);
};

export default TagForm;
