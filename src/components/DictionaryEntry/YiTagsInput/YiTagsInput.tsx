import './YiTagsInput.css';

import { Button, Divider, Empty, Select, SelectProps, Tag } from 'antd';
import { UUID } from 'Document/UUID';
import React, { useState, useCallback } from 'react';
import { notUndefined } from 'Document/Utility';
import { IDictionaryTag } from 'Document/Dictionary';
import { OptionProps } from 'antd/lib/select';

export interface YiTagsInputProps
	extends SelectProps<Array<IDictionaryTag | UUID>> {
	allTags: Array<IDictionaryTag>;
	createTag?: (input: string) => void;
}

const YiTagsInput: React.FC<YiTagsInputProps> = ({
	allTags,
	createTag,
	value,
	defaultValue,
	...passProps
}) => {
	const [currentInput, setCurrentInput] = useState('');

	const dropDownRender = useCallback(
		(menu: React.ReactElement) => {
			const visibleOptions = menu.props.options;
			const hasAvaliableOptions = visibleOptions.length > 0;
			const foundExactMatch = visibleOptions.find(
				(option: OptionProps) =>
					option.name.toLowerCase() === currentInput.toLowerCase()
			);
			return (
				<div>
					{hasAvaliableOptions && menu}
					{!hasAvaliableOptions && (
						<Empty
							image={Empty.PRESENTED_IMAGE_SIMPLE}
							description={
								currentInput.length > 0 ? (
									<span>{currentInput} not found</span>
								) : (
									<span>No Tags found</span>
								)
							}
							imageStyle={{
								height: 50,
							}}
						/>
					)}
					{!foundExactMatch && currentInput.length > 0 && (
						<div className="dropdown-addon">
							<Divider style={{ margin: '4px 0' }} />
							<Button
								size="middle"
								type="primary"
								onClick={() => {
									createTag?.(currentInput);
								}}
							>
								{`Create ${currentInput}`}
							</Button>
						</div>
					)}
				</div>
			);
		},
		[createTag, currentInput]
	);

	const tagRenderer = ({
		tag,
		onClose,
		closable,
	}: {
		tag: IDictionaryTag;
		onClose: () => void;
		closable: boolean;
	}) => {
		return (
			<Tag
				color={tag.color || 'default'}
				closable={closable}
				onClose={onClose}
			>
				{tag.name}
			</Tag>
		);
	};

	return (
		<Select
			{...passProps}
			value={value?.map((tag) =>
				typeof tag === 'object' ? tag.id : tag
			)}
			tagRender={(renderProps) => {
				const tag = allTags.find(
					(storeTag) => storeTag.id === renderProps.value.toString()
				);
				if (tag) {
					const { onClose, closable } = renderProps;
					return tagRenderer({
						tag,
						onClose,
						closable,
					});
				}
				return <></>;
			}}
			autoClearSearchValue
			notFoundContent={<></>}
			optionFilterProp="name"
			filterOption
			onSelect={() => setCurrentInput('')}
			onSearch={(val) => setCurrentInput(val)}
			searchValue={currentInput}
			mode="multiple"
			placeholder="Tags"
			allowClear
			dropdownRender={dropDownRender}
		>
			{Object.values(allTags)
				.filter(notUndefined)
				.map((tag) => (
					<Select.Option name={tag.name} key={tag.id} value={tag.id}>
						{tag.name}
					</Select.Option>
				))}
		</Select>
	);
};

export default YiTagsInput;
