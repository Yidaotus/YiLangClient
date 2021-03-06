import { DialogElement, YiEditor } from '@components/Editor/YiEditor';
import React, { useCallback } from 'react';
import {
	Editor,
	Transforms,
	Element as SlateElement,
	Range as SlateRange,
} from 'slate';
import ToolbarButton, { IToolbarItem } from './ToolbarButton';

export interface IDialogButtonProps extends IToolbarItem {
	editor: Editor;
	toolbarChanged: () => void;
	className?: string;
}

const DialogButton: React.FC<IDialogButtonProps> = ({
	icon,
	title,
	editor,
	toolbarChanged,
	className,
}) => {
	const type = 'dialog';
	const selectedBlockType = YiEditor.getTextBlockStyle(editor);
	const inDialog = selectedBlockType === type;

	const toggleDialog = useCallback(() => {
		if (editor.selection) {
			if (!inDialog) {
				const currentTexts: Array<[string, string]> = [];
				const [start, end] = SlateRange.edges(editor.selection);
				const startTopLevelBlockIndex = start.path[0];
				const endTopLevelBlockIndex = end.path[0];

				let currentLevelIndex = startTopLevelBlockIndex;
				while (currentLevelIndex <= endTopLevelBlockIndex) {
					const text = Editor.string(editor, [currentLevelIndex]);
					if (text) {
						const splits = text.split(':');
						if (splits.length === 2) {
							currentTexts.push([
								splits[0].trim(),
								splits[1].trim(),
							]);
						} else {
							currentTexts.push(['', text.trim()]);
						}
					}
					currentLevelIndex++;
				}

				Transforms.removeNodes(editor);
				Transforms.move(editor, { reverse: true });

				if (currentTexts.length < 1) {
					currentTexts.push(['Actor', 'Text']);
				}

				const dialogNode: DialogElement = {
					type: 'dialog',
					children: currentTexts.map(([actor, speech]) => ({
						type: 'dialogLine',
						alignment: 'left',
						color: '',
						name: actor,
						children: [{ text: speech }],
					})),
				};
				Transforms.insertNodes(editor, dialogNode, {
					at: [startTopLevelBlockIndex],
				});
			} else {
				Transforms.unwrapNodes(editor, {
					match: (n) =>
						!Editor.isEditor(n) &&
						SlateElement.isElement(n) &&
						n.type === 'dialog',
					split: true,
				});
				YiEditor.toggleBlockType(editor, 'paragraph', true);
				const [start, end] = SlateRange.edges(editor.selection);
				const startRootPath = start.path[0];
				const endRootPath = end.path[0];
				let currentPath = startRootPath;
				while (currentPath <= endRootPath) {
					const text = Editor.string(editor, [currentPath]);
					Transforms.removeNodes(editor, {
						at: [currentPath],
					});
					Transforms.insertNodes(
						editor,
						{
							type: 'paragraph',
							align: 'left',
							children: [{ text }],
						},
						{ at: [currentPath] }
					);
					currentPath++;
				}
				Transforms.move(editor, { reverse: true });
			}
		}
		return toolbarChanged();
	}, [editor, inDialog, toolbarChanged]);

	return (
		<ToolbarButton
			icon={icon}
			title={title}
			tooltip={title}
			action={toggleDialog}
			active={selectedBlockType === type}
			enabled={selectedBlockType !== 'multiple'}
			className={className}
		/>
	);
};

export default DialogButton;
