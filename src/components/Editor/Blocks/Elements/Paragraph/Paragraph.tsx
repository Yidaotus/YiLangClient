import { IParagraphBlock } from 'Document/Block';
import { FragmentableString } from 'Document/Fragment';
import { getUUID } from 'Document/UUID';
import React from 'react';
import { createBlockDefinition } from 'store/editor/types';
import FragmentedString from '@editor/Fragments/FragmentedString';

/**
 * A simple block which only needs simple styling provided by the given css
 * class.
 *
 * @param className css class for the styling of this block
 * @param content the content of the given block
 * @param showSpelling show spelling if any is provided
 */
const ParagraphBlock: React.FC<IParagraphBlock> = ({
	content,
	fragmentables,
}) => {
	const fragmentable = fragmentables.find((f) => f.id === content);
	return fragmentable ? (
		<div style={{ whiteSpace: 'break-spaces' }}>
			<FragmentedString fragmentable={fragmentable} />
		</div>
	) : null;
};

const ParagraphBlockMemo = React.memo(ParagraphBlock);

const SimpleBlockDefinition = createBlockDefinition({
	type: 'Paragraph',
	block: ParagraphBlock,
	configurators: [],
	render: (block) => <ParagraphBlockMemo {...block} />,
	parse: (content, position) => {
		const fragmentable = FragmentableString(content);
		return {
			type: 'Paragraph',
			content: fragmentable.id,
			id: getUUID(),
			fragmentables: [fragmentable],
			position,
			config: undefined,
		};
	},
});
export default SimpleBlockDefinition;
