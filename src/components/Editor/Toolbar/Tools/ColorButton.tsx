import React from 'react';
import { Editor } from 'slate';
import InvertColorsIcon from '@mui/icons-material/InvertColors';
import ToolbarButton from './ToolbarButton';

export interface IColorButtonProps {
	color: string;
	title: string;
	editor: Editor;
	onChange: () => void;
	className?: string;
}

const ColorButton: React.FC<IColorButtonProps> = ({
	color,
	title,
	editor,
	onChange,
	className,
}) => {
	const selectionColor = Editor.marks(editor)?.color;

	return (
		<ToolbarButton
			icon={<InvertColorsIcon sx={{ color }} />}
			title={title}
			action={() => {
				if (selectionColor === color) {
					Editor.removeMark(editor, 'color');
				} else {
					Editor.addMark(editor, 'color', color);
				}
				return onChange();
			}}
			className={`button color_${color} ${className}`}
			active={selectionColor === color}
		/>
	);
};

export default ColorButton;
