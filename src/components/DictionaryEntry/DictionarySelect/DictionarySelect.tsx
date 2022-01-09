import './DictionarySelect.css';
import React, { useState, useEffect, useMemo } from 'react';
import useDebounce from '@hooks/useDebounce';
import { useDictionarySearch } from '@hooks/DictionaryQueryHooks';
import { Box, TextField, Autocomplete, InputAdornment } from '@mui/material';
import { Search } from '@mui/icons-material';
import { isNotString, isString } from 'Document/Utility';
import { IDictionaryEntryInput } from '../EntryForm/EntryForm';

export interface IRootSelectProps {
	value: IDictionaryEntryInput['roots'];
	placeholder: string;
	createRoot: (input: string) => void;
	onChange: (roots: IDictionaryEntryInput['roots']) => void;
}

const DictionarySelect: React.FC<IRootSelectProps> = ({
	createRoot,
	value,
	placeholder,
	onChange,
}) => {
	const [query, setQuery] = useState('');
	const debouncedSeach = useDebounce(query, 200);
	const [, searchEntries] = useDictionarySearch(debouncedSeach);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		setIsLoading(true);
	}, [query]);

	useEffect(() => {
		setIsLoading(false);
	}, [searchEntries]);

	const autoCompletOptions = useMemo(() => {
		let options: Array<IDictionaryEntryInput['roots'][number] | string> =
			[];
		if (!isLoading) {
			const searchEntriesDeduplicated = searchEntries.filter(
				(opt) => !value.find((v) => v.key === opt.key)
			);
			options = [...value, ...searchEntriesDeduplicated];
		}
		return options;
	}, [isLoading, searchEntries, value]);

	return (
		<Autocomplete
			placeholder={placeholder}
			id="country-select-demo"
			multiple
			fullWidth
			loading={isLoading}
			clearOnBlur
			filterOptions={(options, state) => {
				const newOptions = [...options];
				const { inputValue } = state;
				if (
					inputValue &&
					!isLoading &&
					!options
						.filter(isNotString)
						.find((v) => v.key === inputValue)
				) {
					newOptions.push(inputValue);
				}
				return newOptions;
			}}
			value={value}
			onChange={(_, newValue) => {
				const valuesToCreate = newValue.filter(isString);
				const otherValues = newValue.filter(isNotString);
				for (const valueToCreate of valuesToCreate) {
					createRoot(valueToCreate);
				}
				onChange(otherValues);
			}}
			options={autoCompletOptions}
			autoHighlight
			getOptionLabel={(option) =>
				typeof option === 'string' ? option : option.key
			}
			renderOption={(props, option) => {
				return typeof option !== 'string' ? (
					<Box component="li" {...props}>
						<span>{option.key}</span>
						<span>{option.translations.join(' ,')}</span>
						<span>{option.comment}</span>
					</Box>
				) : (
					<Box component="li" {...props}>
						<span>{`Create ${option}`}</span>
					</Box>
				);
			}}
			renderInput={(params) => (
				<TextField
					{...params}
					variant="outlined"
					label={placeholder}
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					InputProps={{
						...params.InputProps,
						startAdornment: (
							<>
								<InputAdornment position="start">
									<Search />
								</InputAdornment>
								{params.InputProps.startAdornment}
							</>
						),
					}}
				/>
			)}
		/>
	);
};

export default DictionarySelect;
