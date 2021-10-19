import useDictionaryEntry from '@hooks/useDictionaryEntry';
import { UUID } from 'Document/UUID';
import React, { useMemo, useState } from 'react';
import { Editor, Range } from 'slate';
import { ReactEditor, useSlate } from 'slate-react';
import { isNodeAtSelection } from '../CustomEditor';
import DictPopup from './DictPopup';
import Floating from './Floating';

const DictPopupController: React.FC<{
	rootElement: React.RefObject<HTMLElement>;
}> = ({ rootElement }) => {
	const editor = useSlate();
	const [dictId, setDictId] = useState<UUID | null>(null);
	const entry = useDictionaryEntry(dictId);
	const rootEntry = useDictionaryEntry(entry?.root || null);

	const relativeBounding = useMemo(() => {
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
				const wordNode = wordFragment[0];
				const range = ReactEditor.toDOMNode(editor, wordNode);
				const bounding = range.getBoundingClientRect();
				return bounding;
			}
		}
		return null;
	}, [editor]);

	return (
		<Floating
			visible
			parentElement={rootElement}
			relativeBounding={relativeBounding}
		>
			<DictPopup entry={entry} rootEntry={rootEntry} />
		</Floating>
	);
};

export default DictPopupController;
