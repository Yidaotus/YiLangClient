import { useDrag, useDrop } from 'react-dnd';
import { Transforms } from 'slate';
import { useSlateStatic, ReactEditor } from 'slate-react';
import { EditorElement } from '../YiEditor';

const useDraggableElement = (element: EditorElement) => {
	const editor = useSlateStatic();

	const [{ opacity }, dragRef, preview] = useDrag(
		() => ({
			type: 'DragContainer',
			item: element,
			collect: (monitor) => ({
				opacity: monitor.isDragging() ? 0.5 : 1,
			}),
		}),
		[element]
	);
	const [{ hovering }, dropRef] = useDrop(
		() => ({
			accept: 'DragContainer',
			collect: (monitor) => ({
				hovering: monitor.isOver(),
			}),
			drop: (dragElement: EditorElement) => {
				let dragPath = ReactEditor.findPath(editor, dragElement);
				let dropPath = ReactEditor.findPath(editor, element);
				if (!dragPath || !dropPath) {
					return;
				}
				if (dragPath[0] === dropPath[0]) {
					return;
				}
				ReactEditor.focus(editor);
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

	return { opacity, dragRef, hovering, dropRef, preview };
};

export default useDraggableElement;
