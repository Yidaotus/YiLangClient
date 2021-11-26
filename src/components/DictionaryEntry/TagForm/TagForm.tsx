import './TagForm.css';
import { IDictionaryTag, IGrammarPoint } from 'Document/Dictionary';
import React, { useCallback, useState } from 'react';
import YiColorPickerField from '@components/DictionaryEntry/YiColorPickerField/YiColorPickerField';
import { Controller, useFieldArray, UseFormMethods } from 'react-hook-form';
import { Button, InputGroup, Switch } from '@blueprintjs/core';

type RHFGrammarPoint = Omit<IGrammarPoint, 'construction'> & {
	construction: Array<{ point: string }>;
};
export type IDictionaryTagInput = Omit<
	IDictionaryTag,
	'id' | 'grammarPoint'
> & {
	grammarPoint: RHFGrammarPoint;
};

interface ITagFormProps {
	form: UseFormMethods<IDictionaryTagInput>;
}

export const INITIAL_TAG_FORM_VALUES: IDictionaryTagInput = {
	lang: 'dft',
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
		if (formValues.grammarPoint?.construction) {
			showAddButton = !!formValues.grammarPoint?.construction?.every(
				(gp) => gp && gp.point.length > 0
			);
		}
		setShowAddConstButton(showAddButton);
	}, [form]);

	const { fields, append, remove } = useFieldArray<{
		point: IGrammarPoint['construction'][0];
	}>({
		control: form.control,
		name: 'grammarPoint.construction',
	});

	return (
		<form
			className="tag-input-form-container"
			onChange={updateShowConstButton}
		>
			<input hidden {...form.register('lang')} />
			<div className="tag-form-line">
				<Controller
					name="name"
					control={form.control}
					defaultValue=""
					render={({ value, onChange }) => (
						<InputGroup
							onChange={onChange}
							placeholder="name"
							value={value}
							fill
						/>
					)}
				/>
				<Controller
					name="color"
					control={form.control}
					defaultValue=""
					render={({ value, onChange }) => (
						<YiColorPickerField value={value} onChange={onChange} />
					)}
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
					render={({ value, onChange }) => (
						<InputGroup
							onChange={onChange}
							placeholder="Name"
							value={value}
							fill
							disabled={!hasGrammarPoint}
						/>
					)}
				/>
			</div>
			<div className="tag-form-line">
				<Controller
					name="grammarPoint.description"
					defaultValue=""
					control={form.control}
					render={({ value, onChange }) => (
						<InputGroup
							onChange={onChange}
							placeholder="Desc"
							value={value}
							fill
							disabled={!hasGrammarPoint}
						/>
					)}
				/>
			</div>
			{hasGrammarPoint &&
				fields.map((field, index) => (
					<div className="source-sub-form" key={field.id}>
						<Controller
							name={`grammarPoint.construction.${index}.point`}
							defaultValue=""
							control={form.control}
							render={({ value, onChange }) => (
								<InputGroup
									onChange={onChange}
									placeholder="Point"
									value={value}
									fill
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
