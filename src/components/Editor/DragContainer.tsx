import React, { ReactNode } from 'react';
import DragHandle from './DnD/DragHandle';
import useDraggableElement from '@components/Editor/DnD/useDraggableElement';
import { EditorElement } from './YiEditor';
import { Box } from '@mui/material';

const HOVER_COLOR = '#4e4e4e10';
interface DragContainerProps {
	element: EditorElement;
	children?: ReactNode;
}

const DragContainer: React.FC<DragContainerProps> = ({ children, element }) => {
	const { hovering, opacity, dragRef, dropRef, preview } =
		useDraggableElement(element);

	return (
		<Box
			ref={dropRef}
			sx={{
				p: 1,
				position: 'relative',
				backgroundColor: hovering ? HOVER_COLOR : 'white',
				borderRadius: '5px',
				opacity,
				'& .drag-handle': {
					opacity: '0%',
				},
				'&:hover .drag-handle': {
					opacity: '100%',
				},
			}}
		>
			<DragHandle ref={dragRef} />
			<div ref={preview}>{children}</div>
		</Box>
	);
};
export default DragContainer;
