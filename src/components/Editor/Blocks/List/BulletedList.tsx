import React from 'react';
import { BulletedListElement } from '@components/Editor/YiEditor';
import { Box } from '@mui/material';
import { RenderElementProps } from 'slate-react';
import DragHandle from '@components/Editor/DnD/DragHandle';
import useDraggableElement from '@components/Editor/DnD/useDraggableElement';

interface BulletedListProps extends RenderElementProps {
	element: BulletedListElement;
}

const BulletedList: React.FC<BulletedListProps> = ({
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
				p: 0,
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
				<ul>{children}</ul>
			</div>
			<DragHandle ref={dragRef} />
		</Box>
	);
};

export default BulletedList;
