import { EditorElement, ParagraphElement } from '@components/Editor/YiEditor';
import { Box } from '@mui/material';
import { useDrag, useDrop } from 'react-dnd';
import React from 'react';
import { ReactEditor, RenderElementProps, useSlateStatic } from 'slate-react';
import { Transforms } from 'slate';

interface ParagraphProps extends RenderElementProps {
	element: ParagraphElement;
}

const Paragraph: React.FC<ParagraphProps> = ({
	children,
	attributes,
	element,
}) => {
	const editor = useSlateStatic();

	const [{ opacity }, dragRef] = useDrag(
		() => ({
			type: 'DragContainer',
			item: element,
			collect: (monitor) => ({
				opacity: monitor.isDragging() ? 0.5 : 1,
			}),
		}),
		[element]
	);
	const [, dropRef] = useDrop<EditorElement, unknown, unknown>(
		() => ({
			accept: 'DragContainer',
			drop: (dragElement) => {
				let dragPath = ReactEditor.findPath(editor, dragElement);
				let dropPath = ReactEditor.findPath(editor, element);
				if (!dragPath || !dropPath) {
					return;
				}
				if (dragPath[0] === dropPath[0]) {
					return;
				}
				const direction = dragPath[0] > dropPath[0] ? 'up' : 'down';
				Transforms.moveNodes(editor, { at: dragPath, to: dropPath });
				if (direction === 'up') {
					Transforms.moveNodes(editor, {
						at: [dropPath[0] + 1],
						to: dragPath,
					});
				} else {
					Transforms.moveNodes(editor, {
						at: [dropPath[0] - 1],
						to: dragPath,
					});
				}
			},
		}),
		[element]
	);
	return (
		<Box
			{...attributes}
			sx={{
				textAlign: element.align || 'left',
				p: 1,
				position: 'relative',
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
			{children}
			<Box
				contentEditable={false}
				ref={dragRef}
				className="drag-handle"
				sx={{
					userSelect: 'none',
					position: 'absolute',
					width: '20px',
					height: '20px',
					top: '0',
					left: '0',
					marginLeft: '-15px',
					marginTop: '10px',
					backgroundColor: 'lightgray',
					':hover': {
						opacity: '100%',
					},
				}}
			/>
		</Box>
	);
};

export default Paragraph;
