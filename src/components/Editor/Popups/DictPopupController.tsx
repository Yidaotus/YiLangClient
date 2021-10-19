import useDictionaryEntry from '@hooks/useDictionaryEntry';
import { UUID } from 'Document/UUID';
import React, { useEffect, useState } from 'react';
import { Editor, Range } from 'slate';
import { ReactEditor, useSlate } from 'slate-react';
import { isNodeAtSelection, WordElement } from '../CustomEditor';
import DictPopup from './DictPopup';
import Floating from './Floating';

const DictPopupController: React.FC<{
	rootElement: React.RefObject<HTMLElement>;
}> = ({ rootElement }) => {
	const editor = useSlate();
	const [dictId, setDictId] = useState<UUID | null>(null);
	const entry = useDictionaryEntry(dictId);
	const rootEntry = useDictionaryEntry(entry?.root || null);
	const [relativeBounding, setRelativeBounding] = useState<DOMRect | null>(
		null
	);

	useEffect(() => {
		const clickedVocab = isNodeAtSelection(
			editor,
			editor.selection,
			'word'
		);

		if (
			clickedVocab &&
			editor.selection &&
			Range.isCollapsed(editor.selection)
		) {
			const wordFragment = Editor.above(editor);
			if (wordFragment) {
				const wordNode = wordFragment[0] as WordElement;
				const range = ReactEditor.toDOMNode(editor, wordNode);
				const bounding = range.getBoundingClientRect();
				setDictId(wordNode.dictId);
				setRelativeBounding(bounding);
			}
		} else {
			setDictId(null);
			setRelativeBounding(null);
		}
	}, [editor, editor.selection]);

	return (
		<Floating
			visible={!!dictId}
			parentElement={rootElement}
			relativeBounding={relativeBounding}
		>
			<DictPopup entry={entry} rootEntry={rootEntry} />
		</Floating>
	);
};

export default DictPopupController;
