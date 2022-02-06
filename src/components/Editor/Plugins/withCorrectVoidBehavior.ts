import { Editor, Node, Path, Range, Transforms } from 'slate';

// See https://github.com/ianstormtaylor/slate/issues/3991#issuecomment-832160304
export const withCorrectVoidBehavior = (editor: Editor) => {
	const { deleteBackward, insertBreak } = editor;

	// if current selection is void node, insert a default node below
	// eslint-disable-next-line no-param-reassign
	editor.insertBreak = () => {
		if (!editor.selection || !Range.isCollapsed(editor.selection)) {
			return insertBreak();
		}

		const selectedNodePath = Path.parent(editor.selection.anchor.path);
		const selectedNode = Node.get(editor, selectedNodePath);
		if (Editor.isVoid(editor, selectedNode)) {
			Editor.insertNode(editor, {
				type: 'paragraph',
				align: 'left',
				children: [{ text: '' }],
			});
			return;
		}

		insertBreak();
	};

	// if prev node is a void node, remove the current node and select the void node
	// eslint-disable-next-line no-param-reassign
	editor.deleteBackward = (unit) => {
		if (
			!editor.selection ||
			!Range.isCollapsed(editor.selection) ||
			editor.selection.anchor.offset !== 0
		) {
			return deleteBackward(unit);
		}

		const parentPath = Path.parent(editor.selection.anchor.path);
		const parentNode = Node.get(editor, parentPath);
		const parentIsEmpty = Node.string(parentNode).length === 0;

		if (parentIsEmpty && Path.hasPrevious(parentPath)) {
			const prevNodePath = Path.previous(parentPath);
			const prevNode = Node.get(editor, prevNodePath);
			if (Editor.isVoid(editor, prevNode)) {
				return Transforms.removeNodes(editor);
			}
		}

		deleteBackward(unit);
	};

	return editor;
};
