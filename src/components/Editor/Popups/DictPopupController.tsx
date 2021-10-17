import useDictionaryEntry from '@hooks/useDictionaryEntry';
import { UUID } from 'Document/UUID';
import React, { useReducer, useState, useEffect } from 'react';
import { Editor, Range } from 'slate';
import { ReactEditor, useSlate } from 'slate-react';
import { isNodeAtSelection, WordElement } from '../CustomEditor';
import DictPopup from './DictPopup';
import { floatingReducer } from './Floating';

const DictPopupController: React.FC<{
	rootElement: React.RefObject<HTMLElement>;
}> = ({ rootElement }) => {
	const editor = useSlate();
	const [dictId, setDictId] = useState<UUID | null>(null);
	const entry = useDictionaryEntry(dictId);
	const rootEntry = useDictionaryEntry(entry?.root || null);

	const [popupContainerState, dispatchPopupContainerState] = useReducer(
		floatingReducer,
		{
			visible: false,
			position: {
				x: 0,
				y: 0,
				width: 0,
				height: 0,
			},
		}
	);

	useEffect(() => {
		const rootNode = rootElement.current;
		const clickedVocab = isNodeAtSelection(
			editor,
			editor.selection,
			'word'
		);
		let wordNode: WordElement | null = null;

		if (
			rootNode &&
			clickedVocab &&
			editor.selection &&
			Range.isCollapsed(editor.selection)
		) {
			const wordFragment = Editor.above(editor);
			if (wordFragment) {
				wordNode = wordFragment[0] as WordElement;
				const range = ReactEditor.toDOMNode(editor, wordNode);
				const rangeBounding = range?.getBoundingClientRect();
				const containerBounding = rootNode.getBoundingClientRect();

				if (rangeBounding && containerBounding) {
					const posX = rangeBounding.x + rangeBounding.width * 0.5;
					const posY = rangeBounding.y + rangeBounding.height;

					const relativeX = posX - containerBounding.x;
					const relativeY = posY - containerBounding.y;
					dispatchPopupContainerState({
						type: 'show',
						position: {
							x: relativeX,
							y: relativeY,
							width: rangeBounding.width,
							height: rangeBounding.height,
							offsetY: 5,
						},
					});
					setDictId(wordNode.dictId);
				}
			}
		} else {
			dispatchPopupContainerState({ type: 'hide' });
		}
	}, [editor, editor.selection, rootElement]);

	return (
		entry && (
			<DictPopup
				popupState={popupContainerState}
				entry={entry}
				rootEntry={rootEntry}
			/>
		)
	);
};

export default DictPopupController;
