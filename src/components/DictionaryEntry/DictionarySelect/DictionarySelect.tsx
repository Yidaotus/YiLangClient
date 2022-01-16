import './DictionarySelect.css';
import React, { useState, useEffect, useMemo } from 'react';
import useDebounce from '@hooks/useDebounce';
import { useDictionarySearch } from '@hooks/DictionaryQueryHooks';
import {
	Box,
	TextField,
	Autocomplete,
	InputAdornment,
	AutocompleteRenderInputParams,
} from '@mui/material';
import { Search } from '@mui/icons-material';
import { isNotString, isString } from 'Document/Utility';
import { IDictionaryEntryInput } from '../EntryForm/EntryForm';

type EntryInputType = IDictionaryEntryInput['roots'];
type EntryInputEntryType = EntryInputType[number];

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

	const autoCompleteOptions = useMemo(() => {
		let options: Array<IDictionaryEntryInput['roots'][number] | string> =
			[];
		if (!isLoading && searchEntries) {
			const searchEntriesDeduplicated = searchEntries.filter(
				(opt) => !value.find((v) => v.key === opt.key)
			);
			options = [...value, ...searchEntriesDeduplicated];
		}
		return options;
	}, [isLoading, searchEntries, value]);

	const filterOptions = (options: (string | EntryInputEntryType)[]) => {
		const newOptions = [...options];
		const inputInOptions = !!options
			.filter(isNotString)
			.find((v) => v.key === query);
		if (query && !isLoading && !inputInOptions) {
			newOptions.push(query);
		}
		return newOptions;
	};

	const renderOption = (
		props: React.HTMLAttributes<HTMLLIElement>,
		option: string | EntryInputEntryType
	) => {
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
	};
	const renderInput = (params: AutocompleteRenderInputParams) => (
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
	);

	const onChangeHandler = (newValue: Array<string | EntryInputEntryType>) => {
		const valuesToCreate = newValue.filter(isString);
		const otherValues = newValue.filter(isNotString);
		for (const valueToCreate of valuesToCreate) {
			createRoot(valueToCreate);
		}
		onChange(otherValues);
	};

	const getOptionLabel = (option: string | EntryInputEntryType) => {
		return typeof option === 'string' ? option : option.key;
	};

	return (
		<Autocomplete
			placeholder={placeholder}
			id="country-select-demo"
			multiple
			fullWidth
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

export default DictionarySelect;
