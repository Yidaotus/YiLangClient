import { Autocomplete, Chip, TextField } from '@mui/material';
import React, { useState } from 'react';

interface TagInputProps {
	value: Array<string>;
	onChange: (newValue: Array<string>) => void;
	error?: string;
	disabled: boolean;
	label: string;
	placeholder: string;
}

const TagInput: React.FC<TagInputProps> = ({
	value,
	onChange,
	error,
	disabled,
	label,
	placeholder,
}) => {
	const [inputValue, setInputValue] = useState('');

	return (
		<Autocomplete
			multiple
			options={[] as Array<string>}
			disabled={disabled}
			PopperComponent={() => null}
			freeSolo
			renderTags={(tagValues, getTagProps) =>
				tagValues.map((option: string, index: number) => (
					<Chip
						variant="outlined"
						label={option}
						{...getTagProps({ index })}
					/>
				))
			}
			inputValue={inputValue}
			onInputChange={(_, newInputValue) => setInputValue(newInputValue)}
			onBlur={() => {
				if (inputValue && value.indexOf(inputValue) < 0) {
					onChange([...value, inputValue]);
				}
				setInputValue('');
			}}
			renderInput={(params) => (
				<TextField
					{...params}
					variant="outlined"
					error={!!error}
					label={label}
					helperText={error || null}
					placeholder={placeholder}
				/>
			)}
			value={value}
			onChange={(_, data) => onChange(data)}
		/>
	);
};

export default TagInput;
