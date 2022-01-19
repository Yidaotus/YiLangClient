import {
	BulletedListElement,
	NumberedListElement,
	YiEditor,
} from '@components/Editor/YiEditor';
import React, { useCallback } from 'react';
import { Editor, Transforms, Element as SlateElement } from 'slate';
import ToolbarButton, { IToolbarItem } from './ToolbarButton';

export interface IListButtonProps extends IToolbarItem {
	type: NumberedListElement['type'] | BulletedListElement['type'];
	editor: Editor;
	toolbarChanged: () => void;
	className?: string;
}

const ListButton: React.FC<IListButtonProps> = ({
	type,
	icon,
	title,
	editor,
	toolbarChanged,
	className,
}) => {
	const selectedBlockType = YiEditor.getTextBlockStyle(editor);
	const inList =
		selectedBlockType === 'bulletedList' ||
		selectedBlockType === 'numberedList';

	const toggleList = useCallback(() => {
		if (inList && selectedBlockType === type) {
			Transforms.unwrapNodes(editor, {
				match: (n) =>
					!Editor.isEditor(n) &&
					SlateElement.isElement(n) &&
					(n.type === 'bulletedList' || n.type === 'numberedList'),
				split: true,
			});
			YiEditor.toggleBlockType(editor, 'paragraph', true);
			return toolbarChanged();
		}

		if (inList && editor.selection) {
			// Todo selection after unwrap invalid??
			YiEditor.toggleBlockType(editor, type, true);
			return toolbarChanged();
		}

		YiEditor.toggleBlockType(editor, type, true);
		const block = { type, children: [] };
		Transforms.wrapNodes(editor, block);
		return toolbarChanged();
	}, [editor, inList, toolbarChanged, selectedBlockType, type]);

	return (
		<ToolbarButton
			icon={icon}
			title={title}
			tooltip={title}
			action={toggleList}
			active={selectedBlockType === type}
			enabled={selectedBlockType !== 'multiple'}
			className={className}
		/>
	);
};

export default ListButton;
