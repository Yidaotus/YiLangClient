import { TitleElement } from '@components/Editor/YiEditor';
import { Box } from '@mui/material';
import React from 'react';
import { RenderElementProps } from 'slate-react';
import DragHandle from '@components/Editor/DnD/DragHandle';
import useDraggableElement from '@components/Editor/DnD/useDraggableElement';

interface TitleProps extends RenderElementProps {
	element: TitleElement;
}

const Title: React.FC<TitleProps> = ({ children, attributes, element }) => {
	const { hovering, opacity, dragRef, dropRef, preview } =
		useDraggableElement(element);

	return (
		<Box
			{...attributes}
			sx={{
				textAlign: element.align || 'left',
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
			<h1 style={{ textAlign: element.align || 'left' }} ref={preview}>
				{children}
			</h1>
			<DragHandle ref={dragRef} />
		</Box>
	);
};

export default Title;
