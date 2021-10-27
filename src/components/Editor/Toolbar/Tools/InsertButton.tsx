import React from 'react';
import { Editor } from 'slate';
import ToolbarButton, { IToolbarItem } from './ToolbarButton';

export interface IInsertButtonProps extends IToolbarItem {
	text: string;
	onChange: () => void;
	editor: Editor;
}

const InsertButton: React.FC<IInsertButtonProps> = ({
	text,
	title,
	onChange,
	editor,
}) => (
	<ToolbarButton
		title={title}
		icon={text}
		action={() => {
			Editor.insertText(editor, text);
			onChange();
		}}
	/>
);

export default InsertButton;