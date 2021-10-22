import './WrapperItem.css';
import { TranslationOutlined } from '@ant-design/icons';
import { Button, Tooltip } from 'antd';
import React, { useState } from 'react';
import { Editor, Transforms, Element as SlateElement } from 'slate';
import {
	isNodeInSelection,
	WordElement,
} from '@components/Editor/CustomEditor';
import WordInput, { useWordInput } from '../Modals/WordEditor/WordEditor';

export interface IToolbarWrapperItem {
	editor: Editor;
}

const tooltip = 'Mark a Word';
const icon = <TranslationOutlined />;
const VocabTool: React.FC<IToolbarWrapperItem> = ({ editor }): JSX.Element => {
	const [wordInputVisible, setWordInputVisible] = useState(false);
	const isActive = isNodeInSelection(editor, editor.selection, 'word');
	const { wordInputState, getUserWord } = useWordInput();

	const wrap = async () => {
		if (editor.selection) {
			setWordInputVisible(true);
			const root = Editor.string(editor, editor.selection, {
				voids: true,
			});
			const entryId = await getUserWord(root);
			if (!entryId) {
				return;
			}
			if (entryId) {
				const vocab: WordElement = {
					type: 'word',
					dictId: entryId,
					children: [{ text: '' }],
				};
				Transforms.wrapNodes(editor, vocab, { split: true });
			}
		}
	};

	const unwrap = () => {
		Transforms.unwrapNodes(editor, {
			match: (n) => {
				return SlateElement.isElement(n) && n.type === 'word';
			},
		});
	};

	return (
		<div>
			<Tooltip title={tooltip} mouseEnterDelay={1}>
				<Button
					type={isActive ? 'primary' : 'default'}
					style={{
						fill: isActive ? 'white' : 'black',
					}}
					onMouseUp={async () => {
						if (isActive) {
							unwrap();
						} else {
							wrap();
						}
					}}
				>
					{icon}
				</Button>
			</Tooltip>
			{wordInputVisible && <WordInput {...wordInputState} />}
		</div>
	);
};

export default VocabTool;
