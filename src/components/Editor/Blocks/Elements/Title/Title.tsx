import './Title.css';
import { FontSizeOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { ITitleBlock } from 'Document/Block';
import { FragmentableString } from 'Document/Fragment';
import { getUUID } from 'Document/UUID';
import React from 'react';
import {
	BlockConfigurator,
	createBlockConfigurator,
	createBlockDefinition,
} from '@store/editor/types';
import FragmentedString from '@editor/Fragments/FragmentedString';

const TitleBlockConfiguratorT1 = createBlockConfigurator({
	blockType: 'Title',
	icon: <FontSizeOutlined />,
	title: 'Font Size 1',
	parameter: 'size',
	value: 1,
});

const TitleBlockConfiguratorT2 = createBlockConfigurator({
	blockType: 'Title',
	icon: <FontSizeOutlined />,
	title: 'Font Size 2',
	parameter: 'size',
	value: 2,
});

const TitleBlockConfiguratorSubtitle = createBlockConfigurator({
	blockType: 'Title',
	icon: <MenuUnfoldOutlined />,
	title: 'Subtitle',
	parameter: 'subtitle',
	value: (config) => !config.subtitle,
});

const configurators: Array<
	BlockConfigurator<'Title', 'size'> | BlockConfigurator<'Title', 'subtitle'>
> = [
	TitleBlockConfiguratorT1,
	TitleBlockConfiguratorT2,
	TitleBlockConfiguratorSubtitle,
];

/**
 * A simple block which only needs simple styling provided by the given css
 * class.
 *
 * @param className css class for the styling of this block
 * @param content the content of the given block
 * @param showSpelling show spelling if any is provided
 */
const TitleBlock: React.FC<ITitleBlock> = ({
	content,
	config,
	fragmentables,
}) => {
	const { subtitle, size } = config;
	const variantSize = size === 1 ? 35 : 50;
	const spanSize = variantSize - variantSize * (+subtitle * 0.3);
	const color = subtitle ? '#787878' : 'black';
	const fonstStyle = subtitle ? 'italic' : 'normal';
	const contentFragmentable = fragmentables.find((f) => f.id === content);
	return contentFragmentable ? (
		<span
			style={{
				fontSize: `${spanSize}px`,
				color,
				fontStyle: fonstStyle,
			}}
			className={subtitle ? 'subtitle-border' : ''}
		>
			<FragmentedString fragmentable={contentFragmentable} />
		</span>
	) : null;
};

const TitleBlockDefinition = createBlockDefinition({
	type: 'Title',
	block: TitleBlock,
	configurators,
	render: (block) => <TitleBlock {...block} />,
	parse: (content, position) => {
		const fragmentable = FragmentableString(content);
		return {
			type: 'Title',
			content: fragmentable.id,
			id: getUUID(),
			fragmentables: [fragmentable],
			position,
			config: {
				size: 1,
				subtitle: false,
			},
		};
	},
});

export default TitleBlockDefinition;
