import DictEntryWithEdit from '@components/DictionaryEntry/DictEntryWithEdit/DictEntryWithEdit';
import { useDictionaryEntryResolved } from '@hooks/DictionaryQueryHooks';
import useClickOutside from '@hooks/useClickOutside';
import { Box } from '@mui/material';
import { DictionaryEntryID } from 'Document/Utility';
import React, { useEffect, useRef, useState } from 'react';
import { BaseSelection, Editor, Range } from 'slate';
import { ReactEditor, useSlateStatic } from 'slate-react';
import { WordElement, YiEditor } from '../YiEditor';
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
	const floatingRef = useRef<HTMLDivElement>(null);
	const [visible, setVisible] = useState(false);
	const [hasFocus, setHasFocus] = useState(false);
	const [dictId, setDictId] = useState<DictionaryEntryID>();
	const [, entry] = useDictionaryEntryResolved(dictId);
	const [relativeBounding, setRelativeBounding] = useState<DOMRect | null>(
		null
	);
	useClickOutside(floatingRef, () => {
		setHasFocus(false);
		setRelativeBounding(null);
	});

	useEffect(() => {
		if (hasFocus && dictId) {
			setVisible(true);
		} else {
			setVisible(false);
		}
	}, [dictId, hasFocus]);

	useEffect(() => {
		const clickedVocab = YiEditor.isNodeAtSelection(
			editor,
			selection,
			'word'
		);

		if (clickedVocab && selection && Range.isCollapsed(selection)) {
			const wordFragment = Editor.above(editor);
			if (wordFragment) {
				const wordNode = wordFragment[0] as WordElement;
				const range = ReactEditor.toDOMNode(editor, wordNode);
				const bounding = range.getBoundingClientRect();
				setHasFocus(true);
				setDictId(wordNode.dictId);
				setRelativeBounding(bounding);
			}
		} else {
			const [clickNode] = Editor.nodes(editor);
			if (clickNode) {
				setDictId(undefined);
			}
		}
	}, [editor, selection]);

	return (
		<Floating
			visible={visible}
			parentElement={rootElement}
			relativeBounding={relativeBounding}
			arrow
			ref={floatingRef}
		>
			<Box sx={{ p: 1, width: '350px' }}>
				{entry && (
					<DictEntryWithEdit
						entry={entry}
						onRootSelect={(rootId) => {
							setDictId(rootId);
						}}
					/>
				)}
			</Box>
		</Floating>
	);
};

export default DictPopupController;
