import React from 'react';
import { RenderElementProps, useSelected } from 'slate-react';
import { SentenceElement } from '@components/Editor/YiEditor';

export type SentenceFragmentProps = Omit<RenderElementProps, 'element'> & {
	element: SentenceElement;
};
const SentenceFragment: React.FC<SentenceFragmentProps> = ({
	children,
	attributes,
}) => {
	const selected = useSelected();

	return (
		<span
			{...attributes}
			style={{
				borderBottom: '1px dashed #8DA46E',
			}}
		>
			<div style={{ display: 'inline-block' }}>
				<span
					style={{
						borderRadius: '2px',
						backgroundColor: selected ? '#d4ecff' : '',
					}}
				>
					{children}
				</span>
			</div>
		</span>
	);
};

export default SentenceFragment;
