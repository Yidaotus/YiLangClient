import './DictionarySelect.css';
import React, { useCallback, useState } from 'react';
import useDebounce from '@hooks/useDebounce';
import {
	IDictionaryEntry,
	IDictionaryEntryResolved,
} from 'Document/Dictionary';
import { useDictionarySearch } from '@hooks/DictionaryQueryHooks';
import {
	Button,
	Divider,
	Menu,
	MenuItem,
	NonIdealState,
	Spinner,
} from '@blueprintjs/core';
import { ItemRenderer, Select, Suggest } from '@blueprintjs/select';
import { setNestedObjectValues } from 'formik';

export interface IRootSelectProps {
	value: IDictionaryEntry;
	onChange: (entry: IDictionaryEntry) => void;
	placeholder: string;
	createRoot?: (input: string) => void;
}

const entryLabel = (entry: IDictionaryEntryResolved | IDictionaryEntry) => (
	<div className="entry-preview">
		<div className="entry-preview-item">
			<span>{entry.key}</span>
			{entry.spelling && (
				<span className="entry-preview-spelling">{entry.spelling}</span>
			)}
		</div>
		<div className="entry-preview-item">{entry.translations.join(',')}</div>
	</div>
);
const RootSuggest = Suggest.ofType<IDictionaryEntry>();

const DictionarySelect: React.FC<IRootSelectProps> = ({
	createRoot,
	value,
	placeholder,
	onChange,
}) => {
	const [query, setQuery] = useState('');
	const debouncedSeach = useDebounce(query, 500);
	const [searching, searchEntries] = useDictionarySearch(debouncedSeach);

	const dropDownRenderer: ItemRenderer<IDictionaryEntry> = (
		entry,
		{ modifiers, handleClick }
	) => {
		if (!modifiers.matchesPredicate) {
			return null;
		}
		return (
			<MenuItem
				active={modifiers.active}
				key={entry.id || entry.key}
				label={entry.key}
				onClick={handleClick}
				text={entry.key}
				shouldDismissPopover={false}
			/>
		);
	};

	const create = useCallback(() => {
		const savedQuery = query;
		setQuery('');
		createRoot?.(savedQuery);
	}, [query, setQuery, createRoot]);

	return (
		<RootSuggest
			onItemSelect={onChange}
			selectedItem={value}
			fill
			popoverProps={{
				minimal: true,
				fill: true,
				popoverClassName: 'dropdown-container',
			}}
			onQueryChange={setQuery}
			closeOnSelect
			openOnKeyDown
			query={query}
			initialContent={placeholder}
			inputValueRenderer={(item) => item.key}
			itemRenderer={dropDownRenderer}
			itemListRenderer={({ items, renderItem }) => (
				<Menu>
					{items.map((item, index) => renderItem(item, index))}
					{!!createRoot &&
						!!query &&
						!items.find((item) => item.key === query) && (
							<div>
								<Divider />
								<Button fill minimal onClick={create}>
									Create {query}
								</Button>
							</div>
						)}
				</Menu>
			)}
			items={value?.key ? [...searchEntries, value] : searchEntries}
			className="search-autocomplete"
		/>
	);
};

export default DictionarySelect;
