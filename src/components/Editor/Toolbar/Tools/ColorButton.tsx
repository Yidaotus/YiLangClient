import React from 'react';
import { Editor } from 'slate';
import ToolbarButton from './ToolbarButton';

export interface IColorButtonProps {
	color: string;
	icon: React.ReactNode;
	title: string;
	editor: Editor;
	onChange: () => void;
}

const ColorButton: React.FC<IColorButtonProps> = ({
	color,
	icon,
	title,
	editor,
	onChange,
}) => {
	const selectionColor = Editor.marks(editor)?.color;

	return (
		<ToolbarButton
			icon={icon}
			title={title}
			action={() => {
				if (selectionColor === color) {
					Editor.removeMark(editor, 'color');
				} else {
					Editor.addMark(editor, 'color', color);
				}
				return onChange();
			}}
			className={`button color_${color}`}
			active={selectionColor === color}
		/>
	);
};

export default ColorButton;
