import React from 'react';
import { RenderElementProps } from 'slate-react';
import { SentenceElement } from '../CustomEditor';

export type SentenceFragmentProps = Omit<RenderElementProps, 'element'> & {
	element: SentenceElement;
};
const SentenceFragment: React.FC<SentenceFragmentProps> = ({
	children,
	element,
	attributes,
}) => {
	return (
		<span
			{...attributes}
			style={{
				verticalAlign: 'baseline',
				display: 'inline-block',
				borderBottom: '1px dashed #8DA46E',
			}}
		>
			{children}
		</span>
	);
};

export default SentenceFragment;
