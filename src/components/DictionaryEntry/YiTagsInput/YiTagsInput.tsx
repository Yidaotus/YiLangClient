import './YiTagsInput.css';

import React, { useCallback, useState } from 'react';
import { IDictionaryTag } from 'Document/Dictionary';
import {
	ItemRenderer,
	MultiSelect,
	MultiSelectProps,
} from '@blueprintjs/select';
import { Button, Divider, Menu, MenuItem, Tag } from '@blueprintjs/core';

type IStagedDictionaryTag = Omit<IDictionaryTag, 'id'> & { id?: string };

export interface YiTagsInputProps
	extends Partial<MultiSelectProps<IDictionaryTag>> {
	allTags: Array<IStagedDictionaryTag>;
	createTag?: (input: string) => void;
	values: Array<IStagedDictionaryTag>;
	onSelectTag: (tag: IStagedDictionaryTag) => void;
	onRemoveTag: (tag: IStagedDictionaryTag) => void;
}
const TagMultiSelect = MultiSelect.ofType<IStagedDictionaryTag>();

const YiTagsInput: React.FC<YiTagsInputProps> = ({
	allTags,
	createTag,
	values,
	onSelectTag,
	onRemoveTag,
}) => {
	const [query, setQuery] = useState('');

	const tagRenderer = (tag: IStagedDictionaryTag) => {
		return <span>{tag.name}</span>;
	};

	const isSelected = (tag: IStagedDictionaryTag) => {
		return values.indexOf(tag) > -1;
	};

	const dropDownRenderer: ItemRenderer<IStagedDictionaryTag> = (
		tag,
		{ modifiers, handleClick }
	) => {
		if (!modifiers.matchesPredicate || isSelected(tag)) {
			return null;
		}
		return (
			<MenuItem
				active={modifiers.active}
				key={tag.id}
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
			items={allTags}
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
