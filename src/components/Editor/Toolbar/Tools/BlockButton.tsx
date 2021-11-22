import React from 'react';
import {
	EditorBlockElement,
	getTextBlockStyle,
	toggleBlockType,
} from '@components/Editor/CustomEditor';
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
	const isActive = getTextBlockStyle(editor) === type;

	return (
		<ToolbarButton
			tooltip={title}
			title={title}
			action={() => {
				toggleBlockType(editor, type);
				onChange();
			}}
			active={isActive}
			icon={icon}
		/>
	);
};

export default WrapperItem;
