import './DictionarySelect.css';
import React, { useCallback, useState } from 'react';
import useDebounce from '@hooks/useDebounce';
import { useDictionarySearch } from '@hooks/DictionaryQueryHooks';
import { Button, Divider, Menu, MenuItem } from '@blueprintjs/core';
import { ItemRenderer, MultiSelect } from '@blueprintjs/select';
import { IDictionaryEntryInput } from '../EntryForm/EntryForm';

export interface IRootSelectProps {
	values: IDictionaryEntryInput['roots'];
	placeholder: string;
	createRoot?: (input: string) => void;
	onSelectRoot: (roots: IDictionaryEntryInput['roots'][number]) => void;
	onRemoveRoot: (roots: IDictionaryEntryInput['roots'][number]) => void;
}

const RootSuggest =
	MultiSelect.ofType<IDictionaryEntryInput['roots'][number]>();

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

	const dropDownRenderer: ItemRenderer<
		IDictionaryEntryInput['roots'][number]
	> = (entry, { modifiers, handleClick }) => {
		if (!modifiers.matchesPredicate) {
			return null;
		}
		return (
			<MenuItem
				active={modifiers.active}
				key={entry.key}
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
			resetOnSelect
			initialContent={placeholder}
			itemPredicate={(input, entry) =>
				entry.key
					.toLocaleLowerCase()
					.includes(input.toLocaleLowerCase())
			}
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
