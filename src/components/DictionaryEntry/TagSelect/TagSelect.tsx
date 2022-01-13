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
import { isNotString, isString } from 'Document/Utility';
import { useTagSearch } from '@hooks/useTags';
import {
	IDictionaryEntryInput,
	IDictionaryTagInForm,
} from '../EntryForm/EntryForm';
import { IDictionaryTagInput } from '../TagForm/TagForm';

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
		let options: Array<IDictionaryEntryInput['tags'][number] | string> = [];
		if (!isLoading && value && searchTags) {
			const searchEntriesDeduplicated = searchTags.filter(
				(opt) => !value.find((v) => v.name === opt.name)
			);
			options = [...value, ...searchEntriesDeduplicated];
		}
		return options;
	}, [isLoading, searchTags, value]);

	const filterOptions = (
		options: (string | IDictionaryTagInForm | IDictionaryTagInput)[]
	) => {
		const newOptions = [...options];
		const inputInOptions = !!options
			.filter(isNotString)
			.find((v) => v.name === query);
		if (query && !isLoading && !inputInOptions) {
			newOptions.push(query);
		}
		return newOptions;
	};
	const onChangeHandler = (
		newValue: Array<string | IDictionaryTagInForm | IDictionaryTagInput>
	) => {
		const valuesToCreate = newValue.filter(isString);
		const otherValues = newValue.filter(isNotString);
		for (const valueToCreate of valuesToCreate) {
			create(valueToCreate);
		}
		onChange(otherValues);
	};

	const getOptionLabel = (
		option: string | IDictionaryTagInForm | IDictionaryTagInput
	) => (typeof option === 'string' ? option : option.name);

	const renderOption = (
		props: React.HTMLAttributes<HTMLLIElement>,
		option: string | IDictionaryTagInForm | IDictionaryTagInput
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
