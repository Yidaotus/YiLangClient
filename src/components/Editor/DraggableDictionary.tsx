import React, { useEffect, useRef, useState } from 'react';
import Paper from '@mui/material/Paper';
import Draggable from 'react-draggable';
import {
	Accordion,
	AccordionSummary,
	Typography,
	AccordionDetails,
	Box,
	styled,
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { BaseSelection, Editor, Range as SlateRange } from 'slate';
import { useSlateStatic } from 'slate-react';
import { YiEditor, WordElement } from './YiEditor';
import { useDictionaryEntryResolved } from '@hooks/DictionaryQueryHooks';
import { DictionaryEntryID } from 'Document/Utility';
import DictEntryWithEdit from '@components/DictionaryEntry/DictEntryWithEdit/DictEntryWithEdit';

const StyledAccordion = styled(Accordion)(({ theme }) => ({
	'& .MuiAccordionSummary-root.Mui-expanded': {
		minHeight: '48px',
		height: '48px',
	},
}));

interface DraggableDictionaryProps {
	selection: BaseSelection;
}

const DraggableDictionary: React.FC<DraggableDictionaryProps> = ({
	selection,
}) => {
	const isDragging = useRef(false);
	const [expanded, setExpanded] = useState(false);
	const editor = useSlateStatic();
	const [dictId, setDictId] = useState<DictionaryEntryID>();
	const [, entry] = useDictionaryEntryResolved(dictId);

	useEffect(() => {
		const clickedVocab = YiEditor.isNodeAtSelection(
			editor,
			selection,
			'word'
		);

		if (clickedVocab && selection && SlateRange.isCollapsed(selection)) {
			const wordFragment = Editor.above(editor);
			if (wordFragment) {
				const wordNode = wordFragment[0] as WordElement;
				setExpanded(true);
				setDictId(wordNode.dictId);
			}
		} else {
			setDictId(undefined);
		}
	}, [editor, selection]);

	return (
		<Box
			sx={{
				bottom: '0px',
				right: '0px',
				position: 'fixed',
				zIndex: 35,
				width: '350px',
			}}
		>
			<Draggable
				handle="#draggable-dialog-title"
				cancel={'[class*="MuiDialogContent-root"]'}
				onDrag={() => {
					isDragging.current = true;
				}}
				onStop={() => {
					setTimeout(() => {
						isDragging.current = false;
					});
				}}
			>
				<Paper elevation={2}>
					<StyledAccordion expanded={expanded}>
						<AccordionSummary
							sx={(theme) => ({
								backgroundColor: theme.palette.secondary.main,
							})}
							expandIcon={<ExpandMoreIcon />}
							aria-controls="panel1a-content"
							style={{ cursor: 'move' }}
							id="draggable-dialog-title"
							onClick={(e) => {
								if (!isDragging.current) {
									setExpanded(!expanded);
								}
							}}
						>
							<Typography>Dictionary</Typography>
						</AccordionSummary>
						<AccordionDetails>
							{!entry && (
								<Typography>
									Select an entry in your Document.
								</Typography>
							)}
							{entry && (
								<DictEntryWithEdit
									size="small"
									entry={entry}
									onRootSelect={(rootId) => {
										setDictId(rootId);
									}}
								/>
							)}
						</AccordionDetails>
					</StyledAccordion>
				</Paper>
			</Draggable>
		</Box>
	);
};

export default DraggableDictionary;
