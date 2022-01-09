import React, { useState, useEffect, useMemo } from 'react';
import useDebounce from '@hooks/useDebounce';
import { Box, TextField, Autocomplete, InputAdornment } from '@mui/material';
import { Search } from '@mui/icons-material';
import { isNotString, isString } from 'Document/Utility';
import { useTagSearch } from '@hooks/useTags';
import { IDictionaryEntryInput } from '../EntryForm/EntryForm';

export interface ITagSelectProps {
	value: IDictionaryEntryInput['tags'];
	placeholder: string;
	create: (input: string) => void;
	onChange: (tags: IDictionaryEntryInput['tags']) => void;
}

const TagSelect: React.FC<ITagSelectProps> = ({
	create,
	value,
	placeholder,
	onChange,
}) => {
	const [query, setQuery] = useState('');
	const debouncedSeach = useDebounce(query, 200);
	const [, searchTags] = useTagSearch(debouncedSeach);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		setIsLoading(true);
	}, [query]);

	useEffect(() => {
		setIsLoading(false);
	}, [searchTags]);

	const autoCompleteOptions = useMemo(() => {
		let options: Array<IDictionaryEntryInput['tags'][number] | string> = [];
		if (!isLoading && value) {
			const searchEntriesDeduplicated = searchTags.filter(
				(opt) => !value.find((v) => v.name === opt.name)
			);
			options = [...value, ...searchEntriesDeduplicated];
		}
		return options;
	}, [isLoading, searchTags, value]);

	return (
		<Autocomplete
			placeholder={placeholder}
			id="country-select-demo"
			fullWidth
			multiple
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
						.find((v) => v.name === inputValue)
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
					create(valueToCreate);
				}
				onChange(otherValues);
			}}
			options={autoCompleteOptions}
			autoHighlight
			getOptionLabel={(option) =>
				typeof option === 'string' ? option : option.name
			}
			renderOption={(props, option) => {
				return typeof option !== 'string' ? (
					<Box component="li" {...props}>
						<span>{option.name}</span>
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

export default TagSelect;
