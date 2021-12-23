import React from 'react';
import { RenderElementProps } from 'slate-react';
import { MarkElement } from '@components/Editor/YiEditor';

export type IMarkFragmentData = Omit<RenderElementProps, 'element'> & {
	element: MarkElement;
};

const MarkFragment: React.FC<IMarkFragmentData> = ({
	element,
	children,
	attributes,
}) => {
	return (
		<span
			{...attributes}
			style={{ background: element.color, borderRadius: '3px' }}
		>
			{children}
		</span>
	);
};

export default MarkFragment;
