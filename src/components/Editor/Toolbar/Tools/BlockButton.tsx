import React from 'react';
import { EditorBlockElement, YiEditor } from '@components/Editor/YiEditor';
import { Editor } from 'slate';
import ToolbarButton, { IToolbarItem } from './ToolbarButton';

export interface IToolbarWrapperItem extends IToolbarItem {
	type: EditorBlockElement['type'];
	editor: Editor;
	onChange: () => void;
}

const WrapperItem: React.FC<IToolbarWrapperItem> = ({
	type,
	icon,
	title,
	editor,
	onChange,
}): JSX.Element => {
	const isActive = YiEditor.getTextBlockStyle(editor) === type;

	return (
		<ToolbarButton
			tooltip={title}
			title={title}
			action={() => {
				YiEditor.toggleBlockType(editor, type);
				onChange();
			}}
			active={isActive}
			icon={icon}
		/>
	);
};

export default WrapperItem;
