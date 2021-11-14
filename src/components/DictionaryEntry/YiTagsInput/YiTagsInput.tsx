import './YiTagsInput.css';

import React, { useState } from 'react';
import { IDictionaryTag } from 'Document/Dictionary';
import {
	ItemRenderer,
	MultiSelect,
	MultiSelectProps,
} from '@blueprintjs/select';
import {
	Button,
	MenuItem,
	NonIdealState,
	Position,
	Tag,
} from '@blueprintjs/core';

export interface YiTagsInputProps
	extends Partial<MultiSelectProps<IDictionaryTag>> {
	allTags: Array<IDictionaryTag>;
	createTag?: (input: string) => IDictionaryTag;
	values: Array<IDictionaryTag>;
	onSelectTag: (tag: IDictionaryTag) => void;
	onRemoveTag: (tag: IDictionaryTag) => void;
}

const TagMultiSelect = MultiSelect.ofType<IDictionaryTag>();

const YiTagsInput: React.FC<YiTagsInputProps> = ({
	allTags,
	createTag,
	values,
	onSelectTag,
	onRemoveTag,
}) => {
	const [query, setQuery] = useState('');

	const tagRenderer = (tag: IDictionaryTag) => {
		return <Tag color={tag.color || 'default'}>{tag.name}</Tag>;
	};

	const isSelected = (tag: IDictionaryTag) => {
		return values.indexOf(tag) > -1;
	};

	const dropDownRenderer: ItemRenderer<IDictionaryTag> = (
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

	return (
		<TagMultiSelect
			query={query}
			onQueryChange={setQuery}
			itemRenderer={dropDownRenderer}
			tagRenderer={tagRenderer}
			placeholder="Tags"
			items={allTags}
			resetOnSelect
			onItemSelect={onSelectTag}
			itemPredicate={(input, tag) =>
				tag.name.toLocaleLowerCase().includes(input.toLocaleLowerCase())
			}
			selectedItems={values}
			onRemove={onRemoveTag}
			fill
			popoverProps={{
				minimal: true,
				usePortal: false,
				wrapperTagName: 'div',
				fill: true,
			}}
			noResults={
				query && (
					<Button onClick={() => createTag?.(query)}>
						Create {query}
					</Button>
				)
			}
		/>
	);
};

export default YiTagsInput;
