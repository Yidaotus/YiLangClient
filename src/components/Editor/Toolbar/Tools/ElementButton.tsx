import React from 'react';
import {
	EditorInlineElement,
	isNodeInSelection,
	MarkElement,
	toggleBlockType,
} from '@components/Editor/CustomEditor';
import { Editor, Transforms, Element as SlateElement } from 'slate';
import ToolbarButton, { IToolbarItem } from './ToolbarButton';

export interface IToolbarWrapperItem extends IToolbarItem {
	type: EditorInlineElement['type'];
	editor: Editor;
	onChange: () => void;
}

const ElementButton: React.FC<IToolbarWrapperItem> = ({
	type,
	icon,
	title,
	editor,
	onChange,
}): JSX.Element => {
	const isActive = isNodeInSelection(editor, editor.selection, type);

	return (
		<ToolbarButton
			title={title}
			action={() => {
				if (isActive) {
					Transforms.unwrapNodes(editor, {
						match: (e) =>
							SlateElement.isElement(e) && e.type === type,
					});
				} else {
					const element: MarkElement = {
						type: 'mark',
						color: 'green',
						children: [],
					};
					Transforms.wrapNodes(editor, element, { split: true });
				}
				onChange();
			}}
			active={isActive}
			icon={icon}
		/>
	);
};

export default ElementButton;
