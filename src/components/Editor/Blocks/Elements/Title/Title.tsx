import './Title.css';
import { ITitleBlock } from 'Document/Block';
import React from 'react';

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
		/>
	) : null;
};

export default TitleBlock;
