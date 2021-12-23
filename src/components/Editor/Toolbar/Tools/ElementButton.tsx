import React from 'react';
import { EditorInlineElement, YiEditor } from '@components/Editor/YiEditor';
import { Editor, Transforms, Element as SlateElement, Range } from 'slate';
import ToolbarButton, { IToolbarItem } from './ToolbarButton';

export interface IToolbarWrapperItem extends IToolbarItem {
	type: EditorInlineElement['type'];
	editor: Editor;
	onChange: () => void;
	createElement: () => EditorInlineElement;
}

const ElementButton: React.FC<IToolbarWrapperItem> = ({
	type,
	icon,
	title,
	editor,
	onChange,
	createElement,
}): JSX.Element => {
	const isActive = YiEditor.isNodeInSelection(editor, editor.selection, type);

	return (
		<ToolbarButton
			title={title}
			tooltip={title}
			action={() => {
				if (isActive) {
					Transforms.unwrapNodes(editor, {
						match: (e) =>
							SlateElement.isElement(e) && e.type === type,
					});
				} else {
					const element = createElement();
					if (editor.selection) {
						const newRange = Editor.unhangRange(
							editor,
							editor.selection
						);
						Transforms.wrapNodes(editor, element, {
							split: true,
							at: newRange,
						});
					}
				}
				onChange();
			}}
			enabled={
				isActive ||
				(!!editor.selection && !Range.isCollapsed(editor.selection))
			}
			active={isActive}
			icon={icon}
		/>
	);
};

export default ElementButton;
