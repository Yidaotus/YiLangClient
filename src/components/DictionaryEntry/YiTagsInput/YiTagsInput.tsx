import './YiTagsInput.css';

import React, { useCallback, useState } from 'react';
import { IDictionaryTag } from 'Document/Dictionary';
import {
	ItemRenderer,
	MultiSelect,
	MultiSelectProps,
} from '@blueprintjs/select';
import { Button, Divider, Menu, MenuItem } from '@blueprintjs/core';
import useDebounce from '@hooks/useDebounce';
import { useTagSearch } from '@hooks/useTags';
import { isReference } from 'Document/Utility';
import { IDictionaryEntryInput } from '../EntryForm/EntryForm';

type PossibleSelectValues = IDictionaryEntryInput['tags'][number];

export interface YiTagsInputProps
	extends Partial<MultiSelectProps<IDictionaryTag>> {
	createTag?: (input: string) => void;
	values: IDictionaryEntryInput['tags'];
	onSelectTag: (tag: IDictionaryEntryInput['tags'][number]) => void;
	onRemoveTag: (tag: IDictionaryEntryInput['tags'][number]) => void;
}
const TagMultiSelect = MultiSelect.ofType<PossibleSelectValues>();

const YiTagsInput: React.FC<YiTagsInputProps> = ({
	createTag,
	values,
	onSelectTag,
	onRemoveTag,
}) => {
	const tagRenderer = (tag: PossibleSelectValues) => {
		return <span>{tag.name}</span>;
	};

	const isSelected = (tag: PossibleSelectValues) => {
		return values.indexOf(tag) > -1;
	};

	const [query, setQuery] = useState('');
	const debouncedSeach = useDebounce(query, 500);
	const [, searchTags] = useTagSearch(debouncedSeach);

	const dropDownRenderer: ItemRenderer<
		IDictionaryEntryInput['tags'][number]
	> = (tag, { modifiers, handleClick }) => {
		if (!modifiers.matchesPredicate || isSelected(tag)) {
			return null;
		}
		if (isReference(tag)) {
			return <span>tag</span>;
		}
		return (
			<MenuItem
				active={modifiers.active}
				key={tag.name}
				label={tag.name}
				onClick={handleClick}
				text={tag.name}
				shouldDismissPopover={false}
			/>
		);
	};

	const create = useCallback(() => {
		const savedQuery = query;
		setQuery('');
		createTag?.(savedQuery);
	}, [query, setQuery, createTag]);

	return (
		<TagMultiSelect
			className="dropdown-container"
			query={query}
			onQueryChange={setQuery}
			itemRenderer={dropDownRenderer}
			tagRenderer={tagRenderer}
			placeholder="Tags"
			itemDisabled={(item) => isSelected(item)}
			items={[...searchTags, ...values]}
			resetOnSelect
			onItemSelect={onSelectTag}
			itemPredicate={(input, tag) =>
				tag.name.toLocaleLowerCase().includes(input.toLocaleLowerCase())
			}
			itemListRenderer={({ items, renderItem }) => (
				<Menu>
					{items.map((item, index) => renderItem(item, index))}
					{!!createTag &&
						!!query &&
						!items.find((item) => item.name === query) && (
							<div>
								<Divider />
								<Button fill minimal onClick={create}>
									Create {query}
								</Button>
							</div>
						)}
				</Menu>
			)}
			selectedItems={values}
			onRemove={onRemoveTag}
			fill
			popoverProps={{
				minimal: true,
				fill: true,
				popoverClassName: 'dropdown-container',
			}}
		/>
	);
};

export default YiTagsInput;
