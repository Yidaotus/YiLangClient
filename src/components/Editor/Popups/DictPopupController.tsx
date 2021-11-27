import { useDictionaryEntryResolved } from '@hooks/DictionaryQueryHooks';
import React, { useEffect, useState } from 'react';
import { BaseSelection, Editor, Range } from 'slate';
import { ReactEditor, useSlateStatic } from 'slate-react';
import { isNodeAtSelection, WordElement } from '../CustomEditor';
import DictPopup from './DictPopup';
import Floating from './Floating';

export interface IDictPopupControllerProps {
	rootElement: React.RefObject<HTMLElement>;
	selection: BaseSelection;
}

const DictPopupController: React.FC<IDictPopupControllerProps> = ({
	rootElement,
	selection,
}) => {
	const editor = useSlateStatic();
	const [dictId, setDictId] = useState<string>();
	const [, entry] = useDictionaryEntryResolved(dictId);
	const [, rootEntry] = useDictionaryEntryResolved(entry?.root);
	const [relativeBounding, setRelativeBounding] = useState<DOMRect | null>(
		null
	);

	useEffect(() => {
		const clickedVocab = isNodeAtSelection(editor, selection, 'word');

		if (clickedVocab && selection && Range.isCollapsed(selection)) {
			const wordFragment = Editor.above(editor);
			if (wordFragment) {
				const wordNode = wordFragment[0] as WordElement;
				const range = ReactEditor.toDOMNode(editor, wordNode);
				const bounding = range.getBoundingClientRect();
				setDictId(wordNode.dictId);
				setRelativeBounding(bounding);
			}
		} else {
			setDictId(undefined);
			setRelativeBounding(null);
		}
	}, [editor, selection]);

	return (
		<Floating
			visible={!!dictId}
			parentElement={rootElement}
			relativeBounding={relativeBounding}
			arrow
		>
			<DictPopup
				entry={entry}
				rootEntry={entry?.root ? rootEntry : null}
			/>
		</Floating>
	);
};

export default DictPopupController;
