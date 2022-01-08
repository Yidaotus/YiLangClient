import React from 'react';
import { Editor } from 'slate';
import ToolbarButton, { IToolbarItem } from './ToolbarButton';

export interface IInsertButtonProps extends IToolbarItem {
	text: string;
	toolbarChanged: () => void;
	editor: Editor;
	className?: string;
}

const InsertButton: React.FC<IInsertButtonProps> = ({
	text,
	title,
	toolbarChanged,
	editor,
	className,
}) => (
	<ToolbarButton
		title={title}
		text={text}
		icon={text}
		action={() => {
			Editor.insertText(editor, text);
			toolbarChanged();
		}}
		className={className}
	/>
);

export default InsertButton;
