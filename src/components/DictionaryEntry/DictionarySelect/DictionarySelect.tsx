import './DictionarySelect.css';
import React, { useCallback, useState } from 'react';
import useDebounce from '@hooks/useDebounce';
import { IDictionaryEntry } from 'Document/Dictionary';
import { useDictionarySearch } from '@hooks/DictionaryQueryHooks';
import { Button, Divider, Menu, MenuItem } from '@blueprintjs/core';
import { ItemRenderer, MultiSelect } from '@blueprintjs/select';

export interface IRootSelectProps {
	values: Array<IDictionaryEntry>;
	placeholder: string;
	createRoot?: (input: string) => void;
	onSelectRoot: (root: IDictionaryEntry) => void;
	onRemoveRoot: (root: IDictionaryEntry) => void;
}

const RootSuggest = MultiSelect.ofType<IDictionaryEntry>();

const DictionarySelect: React.FC<IRootSelectProps> = ({
	createRoot,
	values,
	placeholder,
	onSelectRoot,
	onRemoveRoot,
}) => {
	const [query, setQuery] = useState('');
	const debouncedSeach = useDebounce(query, 500);
	const [, searchEntries] = useDictionarySearch(debouncedSeach);

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
				label={entry.translations.join(',')}
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
			onItemSelect={onSelectRoot}
			onRemove={onRemoveRoot}
			selectedItems={values}
			fill
			popoverProps={{
				minimal: true,
				fill: true,
				popoverClassName: 'dropdown-container',
			}}
			onQueryChange={setQuery}
			openOnKeyDown
			query={query}
			initialContent={placeholder}
			itemRenderer={dropDownRenderer}
			tagRenderer={(item) => item.key}
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
			items={[...searchEntries, ...values]}
			className="search-autocomplete"
		/>
	);
};

export default DictionarySelect;
