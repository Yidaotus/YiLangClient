import { ParagraphElement } from '@components/Editor/YiEditor';
import { Box } from '@mui/material';
import React from 'react';
import { RenderElementProps } from 'slate-react';
import DragHandle from '@components/Editor/DnD/DragHandle';
import useDraggableElement from '@components/Editor/DnD/useDraggableElement';

interface ParagraphProps extends RenderElementProps {
	element: ParagraphElement;
}

const Paragraph: React.FC<ParagraphProps> = ({
	children,
	attributes,
	element,
}) => {
	const { hovering, opacity, dragRef, dropRef, preview } =
		useDraggableElement(element);

	return (
		<Box
			{...attributes}
			sx={{
				textAlign: element.align || 'left',
				p: 1,
				position: 'relative',
				backgroundColor: hovering ? '#eeeeee40' : 'white',
				opacity,
				'& .drag-handle': {
					opacity: '0%',
				},
				'&:hover .drag-handle': {
					opacity: '100%',
				},
			}}
			ref={(ref: HTMLDivElement) => {
				dropRef(ref);
				// eslint-disable-next-line no-param-reassign
				attributes.ref.current = ref;
			}}
		>
			<div ref={preview}>{children}</div>
			<DragHandle ref={dragRef} />
		</Box>
	);
};

export default Paragraph;
