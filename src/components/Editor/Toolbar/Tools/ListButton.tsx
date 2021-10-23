import {
	BulletedListElement,
	getTextBlockStyle,
	NumberedListElement,
	toggleBlockType,
} from '@components/Editor/CustomEditor';
import React from 'react';
import { Editor, Transforms, Element as SlateElement } from 'slate';
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
					Transforms.unwrapNodes(editor, {
						match: (n) =>
							!Editor.isEditor(n) &&
							SlateElement.isElement(n) &&
							(n.type === 'bulletedList' ||
								n.type === 'numberedList'),
						split: true,
					});
					toggleBlockType(editor, 'paragraph', true);
					return onChange();
				}

				if (inList && editor.selection) {
					// Todo selection after unwrap invalid??
					toggleBlockType(editor, type, true);
					return onChange();
				}

				toggleBlockType(editor, 'listItem', true);
				const block = { type, children: [] };
				Transforms.wrapNodes(editor, block);
				return onChange();
			}}
			active={selectedBlockType === type}
		/>
	);
};

export default ListButton;
