import './LangConfForm.css';
import React from 'react';
import { Controller, useFieldArray, UseFormReturn } from 'react-hook-form';
import {
	Info as InfoIcon,
	Remove as RemoveIcon,
	Add as AddIcon,
} from '@mui/icons-material';
import {
	Box,
	Tooltip,
	TextField,
	IconButton,
	Button,
	Stack,
} from '@mui/material';
import { ILanguageConfig } from '../../../Document/Config';

type ILangFormProps = UseFormReturn<ILanguageConfig>;

const LangConfForm: React.FC<ILangFormProps> = ({ control, register }) => {
	const { fields, append, remove } = useFieldArray({
		control,
		name: 'lookupSources',
	});
	return (
		<>
			<input hidden {...register('id')} />
			<Controller
				name="name"
				control={control}
				defaultValue=""
				render={({ field }) => (
					<TextField {...field} placeholder="Name" label="Name" />
				)}
			/>
			<Box
				sx={{
					display: 'flex',
					alignItems: 'center',
				}}
			>
				<h3>Lookup Sources</h3>
				<Tooltip
					title='
						To create a lookup source enter a name and the URL for
						the source. Important: replace the search string with
						"&#123;&#125;". YiLang will substitude
						"&#123;&#125;" with the given search string.'
				>
					<InfoIcon sx={{ height: '20px' }} />
				</Tooltip>
			</Box>
			<Stack spacing={2}>
				{fields.map((fieldEntry, index) => (
					<Stack direction="row" spacing={1} key={fieldEntry.id}>
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
								<TextField
									{...field}
									label="Source Name"
									placeholder="Source Name"
								/>
							)}
						/>
						<Controller
							name={`lookupSources.${index}.source`}
							defaultValue={fieldEntry.source}
							control={control}
							render={({ field }) => (
								<TextField
									{...field}
									label="Source URL"
									placeholder=""
									sx={{ flexGrow: 1 }}
								/>
							)}
						/>
						<IconButton onClick={() => remove(index)}>
							<RemoveIcon />
						</IconButton>
					</Stack>
				))}
			</Stack>
			<Button
				onClick={() => append({ name: '', source: '', priority: 0 })}
				endIcon={<AddIcon />}
				variant="outlined"
			>
				Add Source
			</Button>
		</>
	);
};

export default LangConfForm;
