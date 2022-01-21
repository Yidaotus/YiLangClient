// Let's make <Card text='Write the docs' /> draggable!

import React from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { ReactEditor, useSlateStatic } from 'slate-react';
import { EditorElement } from './YiEditor';

/**
 * Your Component
 */
const DragContainer: React.FC<{ element: EditorElement }> = ({
	children,
	element,
}) => {
	const editor = useSlateStatic();

	const [{ opacity }, dragRef] = useDrag(() => ({
		type: 'DragContainer',
		item: element,
		collect: (monitor) => ({
			opacity: monitor.isDragging() ? 0.5 : 1,
		}),
	}));
	const [, drop] = useDrop(
		() => ({
			accept: 'DragContainer',
			drop: (dragElement) => {
				console.log(dragElement);
				const pathDrag = ReactEditor.findPath(
					editor,
					dragElement as EditorElement
				);
				console.log(pathDrag);
				const path = ReactEditor.findPath(editor, element);
				console.log('DROP AT: ' + path, ' FROM: ' + pathDrag);
			},
		}),
		[editor, element]
	);
	return (
		<div ref={drop} style={{ opacity }} contentEditable={false}>
			<div ref={dragRef} contentEditable={false}>
				Drag Me
			</div>
			<div>{children}</div>
		</div>
	);
};
export default DragContainer;
