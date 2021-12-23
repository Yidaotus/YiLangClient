import './LangConfForm.css';
import React from 'react';
import { Controller, useFieldArray, UseFormReturn } from 'react-hook-form';
import { Button, InputGroup, Label } from '@blueprintjs/core';
import { InfoCircleOutlined } from '@ant-design/icons';
import { Tooltip2 } from '@blueprintjs/popover2';
import { ILanguageConfig } from '../../../Document/Config';

type ILangFormProps = UseFormReturn<ILanguageConfig>;

const LangConfForm: React.FC<ILangFormProps> = ({ control, register }) => {
	const { fields, append, remove } = useFieldArray({
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
					render={({ field }) => (
						<InputGroup large placeholder="Name" {...field} />
					)}
				/>
			</Label>
			<div className="lu-title">
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
			</div>
			{fields.map((fieldEntry, index) => (
				<div className="source-sub-form" key={fieldEntry.id}>
					<Controller
						name={`lookupSources.${index}.priority`}
						defaultValue={fieldEntry.priority}
						control={control}
						render={({ field }) => <input hidden {...field} />}
					/>
					<Controller
						name={`lookupSources.${index}.name`}
						defaultValue={fieldEntry.name}
						control={control}
						render={({ field }) => (
							<InputGroup large placeholder="Name" {...field} />
						)}
					/>
					<Controller
						name={`lookupSources.${index}.source`}
						defaultValue={fieldEntry.source}
						control={control}
						render={({ field }) => (
							<InputGroup
								large
								placeholder="Name"
								className="input-grow"
								style={{ flexGrow: 1 }}
								{...field}
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
				className="lu-add"
			>
				Add Source
			</Button>
		</>
	);
};

export default LangConfForm;
