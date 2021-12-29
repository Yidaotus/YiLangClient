import React from 'react';
import { RenderElementProps } from 'slate-react';
import { SentenceElement } from '@components/Editor/YiEditor';
import { Tooltip } from '@mui/material';

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
			<Tooltip title={element.translation}>
				<span>{children}</span>
			</Tooltip>
		</span>
	);
};

export default SentenceFragment;
