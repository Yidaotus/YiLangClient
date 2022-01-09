import { AlignValue, YiEditor } from '@components/Editor/YiEditor';
import React from 'react';
import { Editor, Transforms } from 'slate';
import ToolbarButton, { IToolbarItem } from './ToolbarButton';

const toggleAlign = (
	editor: Editor,
	currentAlign: AlignValue,
	newAlign: AlignValue
) => {
	if (currentAlign === newAlign) {
		Transforms.setNodes(
			editor,
			{ align: null },
			{ match: (n) => Editor.isBlock(editor, n) }
		);
	} else {
		Transforms.setNodes(
			editor,
			{ align: newAlign },
			{ match: (n) => Editor.isBlock(editor, n) }
		);
	}
};

export interface IAlignButtonProps extends IToolbarItem {
	align: AlignValue;
	toolbarChanged: () => void;
	editor: Editor;
	className?: string;
}

const AlignButton: React.FC<IAlignButtonProps> = ({
	align,
	icon,
	title,
	editor,
	toolbarChanged,
	className,
}) => {
	const currentAlign = YiEditor.getAlign(editor);

	return (
		<ToolbarButton
			icon={icon}
			title={title}
			tooltip={title}
			action={() => {
				toggleAlign(editor, currentAlign, align);
				return toolbarChanged();
			}}
			active={currentAlign === align}
			className={className}
		/>
	);
};

export default AlignButton;
