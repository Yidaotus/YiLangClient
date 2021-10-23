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
}

const WrapperItem: React.FC<IToolbarWrapperItem> = ({
	type,
	icon,
	title,
	editor,
}): JSX.Element => {
	const isActive = getTextBlockStyle(editor) === type;

	return (
		<ToolbarButton
			title={title}
			action={() => toggleBlockType(editor, type)}
			active={isActive}
			icon={icon}
		/>
	);
};

export default WrapperItem;
