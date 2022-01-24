import React from 'react';
import { NumberedListElement } from '@components/Editor/YiEditor';
import { Box } from '@mui/material';
import { RenderElementProps } from 'slate-react';
import DragHandle from '@components/Editor/DnD/DragHandle';
import useDraggableElement from '@components/Editor/DnD/useDraggableElement';

interface NumberedListProps extends RenderElementProps {
	element: NumberedListElement;
}

const NumberedList: React.FC<NumberedListProps> = ({
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
			<div ref={preview}>
				<ol>{children}</ol>
			</div>
			<DragHandle ref={dragRef} />
		</Box>
	);
};

export default NumberedList;
