import React from 'react';
import { isNodeInSelection } from '@components/Editor/CustomEditor';
import { Editor, Transforms, Element as SlateElement, Range } from 'slate';
import { TranslationOutlined } from '@ant-design/icons';
import ToolbarButton from './ToolbarButton';

export interface IWordButtonProps {
	editor: Editor;
	onChange: () => void;
	showWordEditor: () => void;
}

const WordButton: React.FC<IWordButtonProps> = ({
	editor,
	onChange,
	showWordEditor,
}): JSX.Element => {
	const type = 'word';
	const title = 'Word';
	const icon = <TranslationOutlined />;

	const isActive = isNodeInSelection(editor, editor.selection, type);

	return (
		<ToolbarButton
			title={title}
			action={() => {
				if (isActive) {
					Transforms.unwrapNodes(editor, {
						match: (e) =>
							SlateElement.isElement(e) && e.type === type,
						voids: true,
					});
				} else {
					showWordEditor();
				}
				onChange();
			}}
			enabled={
				isActive ||
				(!!editor.selection && !Range.isCollapsed(editor.selection))
			}
			active={isActive}
			icon={icon}
		/>
	);
};

export default WordButton;
