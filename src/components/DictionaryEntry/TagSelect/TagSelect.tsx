import React, { useState, useEffect, useMemo } from 'react';
import useDebounce from '@hooks/useDebounce';
import {
	Box,
	TextField,
	Autocomplete,
	InputAdornment,
	AutocompleteRenderInputParams,
} from '@mui/material';
import { Search } from '@mui/icons-material';
import { useTagSearch } from '@hooks/useTags';
import { IDictionaryEntryInput } from '../EntryForm/EntryForm';
import { isNotString, isString } from 'Document/Utility';

type TagInputType = IDictionaryEntryInput['tags'];
type TagInputEntryType = TagInputType[number];

export interface ITagSelectProps {
	value: TagInputType;
	placeholder: string;
	create: (input: string) => void;
	onChange: (tags: TagInputType) => void;
}

const TagSelect: React.FC<ITagSelectProps> = ({
	create,
	value,
	placeholder,
	onChange,
}) => {
	const [query, setQuery] = useState('');
	const debouncedSeach = useDebounce(query, 500);
	const [, searchTags] = useTagSearch(debouncedSeach);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		setIsLoading(true);
	}, [query]);

	useEffect(() => {
		setIsLoading(false);
	}, [searchTags]);

	const autoCompleteOptions = useMemo(() => {
		let options: Array<string | TagInputEntryType> = [];
		if (!isLoading && value && searchTags) {
			const searchEntriesDeduplicated = searchTags.filter(
				(opt) => !value.find((v) => v.name === opt.name)
			);
			options = [...value, ...searchEntriesDeduplicated];
		}
		return options;
	}, [isLoading, searchTags, value]);

	const filterOptions = (options: Array<string | TagInputEntryType>) => {
		const newOptions = [...options];
		const inputInOptions = !!options
			.filter(isNotString)
			.find((v) => v.name === query);
		if (query && !isLoading && !inputInOptions) {
			newOptions.push(query);
		}
		return newOptions;
	};
	const onChangeHandler = (newValue: Array<string | TagInputEntryType>) => {
		const valuesToCreate = newValue.filter(isString);
		const otherValues: TagInputType = newValue.filter(isNotString);
		for (const valueToCreate of valuesToCreate) {
			create(valueToCreate);
		}
		onChange(otherValues);
	};

	const getOptionLabel = (option: string | TagInputEntryType) =>
		typeof option === 'string' ? option : option.name;

	const renderOption = (
		props: React.HTMLAttributes<HTMLLIElement>,
		option: string | TagInputEntryType
	) => {
		return typeof option !== 'string' ? (
			<Box component="li" {...props} id="tag-select-options">
				<span>{option.name}</span>
			</Box>
		) : (
			<Box {...props} component="li" id="tag-select-create-option">
				<span>{`Create ${option}`}</span>
			</Box>
		);
	};

	const renderInput = (params: AutocompleteRenderInputParams) => (
		<TextField
			{...params}
			id="tag-select-input"
			label={placeholder}
			value={query}
			onChange={(e) => setQuery(e.target.value)}
			data-test-loading={isLoading}
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
	);

	return (
		<Autocomplete
			placeholder={placeholder}
			fullWidth
			multiple
			loading={isLoading}
			clearOnBlur
			filterOptions={filterOptions}
			value={value}
			onChange={(_, newValue) => onChangeHandler(newValue)}
			options={autoCompleteOptions}
			autoHighlight
			getOptionLabel={getOptionLabel}
			renderOption={renderOption}
			renderInput={renderInput}
		/>
	);
};

export default TagSelect;
