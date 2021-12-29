import React from 'react';
import { YiEditor } from '@components/Editor/YiEditor';
import { Editor, Transforms, Element as SlateElement, Range } from 'slate';
import ToolbarButton from './ToolbarButton';

export interface IInputWrapperButtonProps {
	editor: Editor;
	onChange: () => void;
	type: SlateElement['type'];
	title: string;
	icon: React.ReactElement | string;
	showInput: () => void;
}

const InputWrapperButton: React.FC<IInputWrapperButtonProps> = ({
	editor,
	onChange,
	type,
	title,
	icon,
	showInput,
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
						voids: true,
					});
				} else {
					showInput();
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

export default InputWrapperButton;
