import { IParagraphBlock } from 'Document/Block';
import React from 'react';

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
	return fragmentable ? <div style={{ whiteSpace: 'break-spaces' }} /> : null;
};

export default ParagraphBlock;
