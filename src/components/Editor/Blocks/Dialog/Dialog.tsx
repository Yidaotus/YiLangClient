import { DialogElement } from '@components/Editor/YiEditor';
import { Paper } from '@mui/material';
import React from 'react';
import { RenderElementProps } from 'slate-react';
import DragHandle from '@components/Editor/DnD/DragHandle';
import useDraggableElement from '@components/Editor/DnD/useDraggableElement';

interface DialogProps extends RenderElementProps {
	element: DialogElement;
}

const Dialog: React.FC<DialogProps> = ({ children, attributes, element }) => {
	const { hovering, opacity, dragRef, dropRef, preview } =
		useDraggableElement(element);

	return (
		<Paper
			{...attributes}
			sx={{
				p: 1,
				m: 1,
				position: 'relative',
				backgroundColor: hovering ? '#eeeeee40' : '',
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
		</Paper>
	);
};

export default Dialog;
