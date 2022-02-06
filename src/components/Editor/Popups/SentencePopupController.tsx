import {
	useDictionarySentence,
	useUpdateDictionarySentence,
} from '@hooks/DictionaryQueryHooks';
import useClickOutside from '@hooks/useClickOutside';
import { Edit, Save } from '@mui/icons-material';
import { Box, Divider, IconButton, InputBase, Typography } from '@mui/material';
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
	const [sentenceEdit, setSentenceEdit] = useState<string>();
	const [isEditing, setIsEditing] = useState(false);
	const textSpanRef = useRef<HTMLSpanElement | null>(null);
	const editInputRef = useRef<HTMLInputElement | null>(null);
	const [sentenceId, setSentenceId] = useState<DictionarySentenceID>();
	const [, sentence] = useDictionarySentence(sentenceId);
	const updateDictionarySentence = useUpdateDictionarySentence();
	const [editingFieldWidth, setEditingFieldWidth] = useState(0);
	const [editingFieldHeight, setEditingFieldHeight] = useState(0);
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
				setIsEditing(false);
			}
		} else {
			const [clickNode] = Editor.nodes(editor);
			if (clickNode) {
				setSentenceId(undefined);
				setIsEditing(false);
			}
		}
	}, [editor, selection]);

	const handleEditClick = () => {
		if (sentence) {
			if (textSpanRef.current) {
				setEditingFieldWidth(textSpanRef.current.clientWidth);
				setEditingFieldHeight(textSpanRef.current.clientHeight);
			}
			setSentenceEdit(sentence.translation);
			setIsEditing(true);
			setTimeout(() => {
				editInputRef.current?.focus();
			});
		}
	};

	const handleSaveClick = async () => {
		if (sentenceEdit && sentence) {
			if (sentenceEdit !== sentence.translation) {
				await updateDictionarySentence.mutateAsync({
					...sentence,
					translation: sentenceEdit,
				});
			}

			setIsEditing(false);
		}
	};

	const handleInputKeyPress: React.KeyboardEventHandler<HTMLDivElement> = (
		e
	) => {
		if (e.key === 'Enter') {
			handleSaveClick();
		}
	};

	const handleSentenceEditChange: React.ChangeEventHandler<
		HTMLTextAreaElement | HTMLInputElement
	> = (e) => {
		setSentenceEdit(e.target.value);
	};

	return (
		<Floating
			visible={visible}
			parentElement={rootElement}
			relativeBounding={relativeBounding}
			arrow
			ref={floatingRef}
		>
			<Box sx={{ p: 0, maxWidth: '650px', display: 'flex' }}>
				{!isEditing && sentence && (
					<>
						<Typography
							variant="body2"
							component="span"
							sx={{ p: 1 }}
							ref={textSpanRef}
						>
							{sentence.translation}
						</Typography>
						<Divider orientation="vertical" flexItem />
						<IconButton aria-label="edit" onClick={handleEditClick}>
							<Edit fontSize="small" sx={{ m: 0, p: 0 }} />
						</IconButton>
					</>
				)}
				{isEditing && (
					<>
						<InputBase
							value={sentenceEdit}
							onChange={handleSentenceEditChange}
							placeholder="Translation"
							onKeyPress={handleInputKeyPress}
							sx={(theme) => ({
								width: `${editingFieldWidth}px`,
								height: `${editingFieldHeight}px`,
								fontSize: '0.875rem',
								pl: 1,
								backgroundColor: theme.palette.secondary.light,
							})}
							inputProps={{
								'aria-label': 'change sentence translation',
							}}
							inputRef={editInputRef}
						/>
						<Divider orientation="vertical" flexItem />
						<IconButton aria-label="save" onClick={handleSaveClick}>
							<Save fontSize="small" sx={{ m: 0, p: 0 }} />
						</IconButton>
					</>
				)}
			</Box>
		</Floating>
	);
};

export default SentencePopupController;
