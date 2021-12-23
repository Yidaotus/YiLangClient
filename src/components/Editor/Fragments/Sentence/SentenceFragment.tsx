import { Tooltip2 } from '@blueprintjs/popover2';
import React from 'react';
import { RenderElementProps } from 'slate-react';
import { SentenceElement } from '@components/Editor/YiEditor';

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
				borderBottom: '1px dashed #8DA46E',
			}}
		>
			<Tooltip2
				content={element.translation}
				hoverOpenDelay={500}
				position="top"
			>
				<span>{children}</span>
			</Tooltip2>
		</span>
	);
};

export default SentenceFragment;
