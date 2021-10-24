import { AlignValue, getAlign } from '@components/Editor/CustomEditor';
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
	onChange: () => void;
	editor: Editor;
}

const AlignButton: React.FC<IAlignButtonProps> = ({
	align,
	icon,
	title,
	editor,
	onChange,
}) => {
	const currentAlign = getAlign(editor);

	return (
		<ToolbarButton
			icon={icon}
			title={title}
			action={() => {
				toggleAlign(editor, currentAlign, align);
				return onChange();
			}}
			active={currentAlign === align}
		/>
	);
};

export default AlignButton;
