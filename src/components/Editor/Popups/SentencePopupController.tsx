import { useDictionarySentence } from '@hooks/DictionaryQueryHooks';
import useClickOutside from '@hooks/useClickOutside';
import { Box, Typography } from '@mui/material';
import { DictionarySentenceID } from 'Document/Utility';
import React, { useEffect, useRef, useState } from 'react';
import { BaseSelection, Editor, Range } from 'slate';
import { ReactEditor, useSlateStatic } from 'slate-react';
import { SentenceElement, YiEditor } from '../YiEditor';
import Floating from './Floating';

export interface ISentencePopupControllerProps {
	rootElement: React.RefObject<HTMLElement>;
	selection: BaseSelection;
}

const SentencePopupController: React.FC<ISentencePopupControllerProps> = ({
	rootElement,
	selection,
}) => {
	const editor = useSlateStatic();
	const floatingRef = useRef<HTMLDivElement>(null);
	const [sentenceId, setSentenceId] = useState<DictionarySentenceID>();
	const [, sentence] = useDictionarySentence(sentenceId);
	const [relativeBounding, setRelativeBounding] = useState<DOMRect | null>(
		null
	);
	useClickOutside(floatingRef, () => {
		setRelativeBounding(null);
	});

	const visible = !!sentenceId;

	useEffect(() => {
		const clickedSentence = YiEditor.isNodeAtSelection(
			editor,
			selection,
			'sentence'
		);

		if (clickedSentence && selection && Range.isCollapsed(selection)) {
			const sentenceFragment = Editor.above(editor);
			if (sentenceFragment) {
				const sentenceNode = sentenceFragment[0] as SentenceElement;
				const range = ReactEditor.toDOMNode(editor, sentenceNode);
				const bounding = range.getBoundingClientRect();
				setSentenceId(sentenceNode.sentenceId);
				setRelativeBounding(bounding);
			}
		} else {
			const [clickNode] = Editor.nodes(editor);
			if (clickNode) {
				setSentenceId(undefined);
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
			<Box sx={{ p: 1, maxWidth: '650px' }}>
				{sentence && (
					<Typography variant="body2" component="span">
						{sentence.translation}
					</Typography>
				)}
			</Box>
		</Floating>
	);
};

export default SentencePopupController;
