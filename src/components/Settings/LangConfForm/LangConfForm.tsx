import './LangConfForm.css';
import React from 'react';
import { Controller, useFieldArray, UseFormMethods } from 'react-hook-form';
import { Button, InputGroup, Label } from '@blueprintjs/core';
import { InfoCircleOutlined } from '@ant-design/icons';
import { Tooltip2 } from '@blueprintjs/popover2';
import { ILanguageConfig } from '../../../Document/Config';

type ILangFormProps = UseFormMethods<ILanguageConfig>;

const LangConfForm: React.FC<ILangFormProps> = ({ control, register }) => {
	const { fields, append, remove } = useFieldArray<
		ILanguageConfig['lookupSources'][0]
	>({
		control,
		name: 'lookupSources',
	});
	return (
		<>
			<h3>Name</h3>
			<input hidden {...register('id')} />
			<Label>
				Language Name
				<Controller
					name="name"
					control={control}
					defaultValue=""
					render={({ value, onChange }) => (
						<InputGroup
							large
							onChange={onChange}
							placeholder="Name"
							value={value}
						/>
					)}
				/>
			</Label>
			<h3>Lookup Sources</h3>
			<Tooltip2
				placement="bottom"
				content='
						To create a lookup source enter a name and the URL for
						the source. Important: replace the search string with
						"&#123;&#125;". YiLang will substitude
						"&#123;&#125;" with the given search string.'
			>
				<InfoCircleOutlined />
			</Tooltip2>
			{fields.map((field, index) => (
				<div className="source-sub-form" key={field.id}>
					<Controller
						name={`lookupSources.${index}.priority`}
						defaultValue={field.priority}
						control={control}
						render={({ value, onChange }) => (
							<input hidden onChange={onChange} value={value} />
						)}
					/>
					<Controller
						name={`lookupSources.${index}.name`}
						defaultValue={field.name}
						control={control}
						render={({ value, onChange }) => (
							<InputGroup
								large
								onChange={onChange}
								placeholder="Name"
								value={value}
							/>
						)}
					/>
					<Controller
						name={`lookupSources.${index}.source`}
						defaultValue={field.source}
						control={control}
						render={({ value, onChange }) => (
							<InputGroup
								large
								onChange={onChange}
								placeholder="Name"
								value={value}
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
			<Button
				fill
				minimal
				onClick={() => append({ name: '', source: '', priority: 0 })}
				icon="plus"
			>
				Add Source
			</Button>
		</>
	);
};

export default LangConfForm;
