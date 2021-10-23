import {
	BulletedListElement,
	getTextBlockStyle,
	NumberedListElement,
	toggleBlockType,
} from '@components/Editor/CustomEditor';
import React from 'react';
import { Editor, Transforms } from 'slate';
import ToolbarButton, { IToolbarItem } from './ToolbarButton';

export interface IListButtonProps extends IToolbarItem {
	type: NumberedListElement['type'] | BulletedListElement['type'];
	editor: Editor;
	onChange: () => void;
}

const ListButton: React.FC<IListButtonProps> = ({
	type,
	icon,
	title,
	editor,
	onChange,
}) => {
	const selectedBlockType = getTextBlockStyle(editor);
	const inList =
		selectedBlockType === 'bulletedList' ||
		selectedBlockType === 'numberedList';

	return (
		<ToolbarButton
			icon={icon}
			title={title}
			action={() => {
				if (inList && selectedBlockType === type) {
					toggleBlockType(editor, 'paragraph');
					return onChange();
				}

				if (inList && editor.selection) {
					// Todo selection after unwrap invalid??
					Transforms.unwrapNodes(editor);
					toggleBlockType(editor, type);
					return onChange();
				}

				toggleBlockType(editor, type);
				return onChange();
			}}
			active={selectedBlockType === type}
		/>
	);
};

export default ListButton;
