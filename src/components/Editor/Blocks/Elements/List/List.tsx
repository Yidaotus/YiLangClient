import React from 'react';
import {
	createBlockConfigurator,
	createBlockDefinition,
} from 'store/editor/types';
import { OrderedListOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { IListBlock } from 'Document/Block';
import { FragmentableString } from 'Document/Fragment';
import { getUUID } from 'Document/UUID';
import FragmentedString from '@editor/Fragments/FragmentedString';

/**
 * Renders a dialog.
 *
 * @param lines the lines of the given dialog. Each line is rendered as a
 *				seperate RenderableString.
 */
const ListBlock: React.FC<IListBlock> = ({ fragmentables, items, config }) => {
	const { style } = config;
	const renderedItems = items.map((item) => {
		const fragmentable = fragmentables.find((f) => f.id === item);
		return fragmentable ? (
			<li key={fragmentable.id}>
				<FragmentedString fragmentable={fragmentable} />
			</li>
		) : null;
	});
	return (
		<div className="list-block">
			{style === 'unordered' ? (
				<ul>{renderedItems}</ul>
			) : (
				<ol>{renderedItems}</ol>
			)}
		</div>
	);
};

const ListBlockConfiguratorOrdered = createBlockConfigurator({
	blockType: 'List',
	icon: <OrderedListOutlined />,
	title: 'Ordered',
	parameter: 'style',
	value: 'ordered',
});

const ListBlockConfiguratorUnordered = createBlockConfigurator({
	blockType: 'List',
	icon: <UnorderedListOutlined />,
	title: 'Ordered',
	parameter: 'style',
	value: 'unordered',
});

const ListBlockDefinition = createBlockDefinition({
	type: 'List',
	block: ListBlock,
	configurators: [
		ListBlockConfiguratorOrdered,
		ListBlockConfiguratorUnordered,
	],
	render: (block) => <ListBlock {...block} />,
	parse: (content, position) => {
		const items = content.split('\n');

		const fragmentables = items.map((item) => FragmentableString(item));
		return {
			type: 'List',
			id: getUUID(),
			fragmentables,
			position,
			items: fragmentables.map((frag) => frag.id),
			config: {
				style: 'ordered',
			},
		};
	},
});

export default ListBlockDefinition;
