import React, { useCallback, useRef, useState } from 'react';
import Paper from '@mui/material/Paper';
import Draggable from 'react-draggable';
import {
	Accordion,
	AccordionSummary,
	Typography,
	AccordionDetails,
	Box,
	styled,
	Button,
	FormControl,
	InputLabel,
	MenuItem,
	Select,
	SelectChangeEvent,
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon, StarRounded } from '@mui/icons-material';
import {
	NodeEntry,
	Node as SlateNode,
	Element as SlateElement,
	Editor,
} from 'slate';
import { CustomEditor, EditorElement, WordElement } from '../YiEditor';
import BasicSRS, { CardRenderer } from './BasicSRS';
import DoneIcon from '@mui/icons-material/Done';
import DictionaryEntryCard from './DictionaryEntryCard';
import { DictionaryEntryID } from 'Document/Utility';
import DictionarySentenceCard, {
	SRSSentenceItem,
} from './DictionarySentenceCard';
import { TypeOf } from 'yup';

const StyledAccordion = styled(Accordion)(() => ({
	'& .MuiAccordionSummary-root.Mui-expanded': {
		minHeight: '48px',
		height: '48px',
	},
}));

type SRSState = 'Start' | 'Running' | 'Finish';
type SRSItemState<T> = T extends any
	? { items: Array<T>; renderer: CardRenderer<T> }
	: never;

const DraggableSRS: React.FC<{ editor: CustomEditor }> = ({ editor }) => {
	const isDragging = useRef(false);
	const nodeRef = React.useRef(null);
	const [expanded, setExpanded] = useState(false);
	const [srsState, setSRSState] = useState<SRSState>('Start');
	const [itemType, setItemType] = useState<'Vocab' | 'Sentence'>('Vocab');
	const [srsItemState, setSrsItemState] =
		useState<SRSItemState<DictionaryEntryID | SRSSentenceItem>>();

	const initialize = useCallback(() => {
		if (itemType === 'Vocab') {
			const entryIds: Array<DictionaryEntryID> = [];
			const vocabNodes = SlateNode.elements(editor, {
				pass: (n): n is NodeEntry<WordElement> =>
					SlateElement.isElement(n) &&
					n.type === 'word' &&
					n.isUserInput === true,
			});
			if (vocabNodes) {
				for (const vocabNode of vocabNodes) {
					if (
						vocabNode[0].type === 'word' &&
						vocabNode[0].isUserInput
					) {
						entryIds.push(vocabNode[0].dictId);
					}
				}
			}
			setSrsItemState({
				items: entryIds,
				renderer: DictionaryEntryCard,
			});
		} else {
			const sentences: Array<SRSSentenceItem> = [];
			const sentenceNodes = SlateNode.elements(editor, {
				pass: (n): n is NodeEntry<WordElement> =>
					SlateElement.isElement(n) && n.type === 'sentence',
			});
			if (sentenceNodes) {
				for (const sentenceNode of sentenceNodes) {
					if (sentenceNode[0].type === 'sentence') {
						const nodeContent = Editor.string(
							editor,
							sentenceNode[1]
						);
						sentences.push({
							sentence: nodeContent,
							translation: sentenceNode[0].translation,
						});
					}
				}
			}
			setSrsItemState({
				items: sentences,
				renderer: DictionarySentenceCard,
			});
		}
	}, [editor, itemType]);

	const start = useCallback(() => {
		initialize();
		setSRSState('Running');
	}, [initialize]);

	const finish = useCallback(() => {
		setSRSState('Finish');
	}, []);

	const expand = useCallback(() => {
		if (!isDragging.current) {
			setExpanded(!expanded);
		}
	}, [expanded]);

	const handleTypeChange = (event: SelectChangeEvent<typeof itemType>) => {
		setItemType(event.target.value as typeof itemType);
	};

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
				handle="#draggable-srs-title"
				cancel={'[class*="MuiDialogContent-root"]'}
				onDrag={() => {
					isDragging.current = true;
				}}
				onStop={() => {
					setTimeout(() => {
						isDragging.current = false;
					});
				}}
				nodeRef={nodeRef}
			>
				<Paper elevation={2} ref={nodeRef}>
					<StyledAccordion expanded={expanded}>
						<AccordionSummary
							sx={(theme) => ({
								backgroundColor: theme.palette.secondary.light,
							})}
							expandIcon={<ExpandMoreIcon />}
							aria-controls="sls-content"
							style={{ cursor: 'move' }}
							id="draggable-srs-title"
							onClick={expand}
						>
							<Box sx={{ display: 'flex', alignItems: 'center' }}>
								<StarRounded sx={{ paddingRight: 1 }} />
								<Typography>SRS</Typography>
							</Box>
						</AccordionSummary>
						<AccordionDetails>
							<Box
								sx={{
									display: 'flex',
									alignItems: 'center',
									flexDirection: 'column',
									justifyContent: 'space-between',
									width: '100%',
									minHeight: '250px',
								}}
							>
								{srsItemState && srsState === 'Running' && (
									<BasicSRS
										// @ts-ignore
										items={srsItemState.items}
										// @ts-ignore
										itemRenderer={srsItemState.renderer}
										finished={finish}
									/>
								)}
								{(srsState === 'Start' ||
									srsState === 'Finish') && (
									<FormControl
										variant="standard"
										sx={{ m: 1, minWidth: 120 }}
									>
										<InputLabel id="demo-simple-select-standard-label">
											Items
										</InputLabel>
										<Select
											labelId="demo-simple-select-standard-label"
											id="demo-simple-select-standard"
											value={itemType}
											onChange={handleTypeChange}
											label="Item Type"
										>
											<MenuItem value="Vocab">
												Vocab
											</MenuItem>
											<MenuItem value="Sentence">
												Sentence
											</MenuItem>
										</Select>
									</FormControl>
								)}
								{srsState === 'Start' && (
									<Button onClick={start} variant="contained">
										Start
									</Button>
								)}
								{srsState === 'Finish' && (
									<>
										<Box sx={{ display: 'flex' }}>
											<DoneIcon color="success" />
											<Typography>
												All finished up!
											</Typography>
										</Box>
										<Button
											onClick={start}
											variant="contained"
										>
											Start again
										</Button>
									</>
								)}
							</Box>
						</AccordionDetails>
					</StyledAccordion>
				</Paper>
			</Draggable>
		</Box>
	);
};

export default React.memo(
	DraggableSRS,
	(_, nextProps) =>
		!!!nextProps.editor.operations.some(
			(op) =>
				(op.type === 'insert_node' || op.type === 'remove_node') &&
				((op.node as EditorElement).type === 'sentence' ||
					(op.node as EditorElement).type === 'word')
		)
);
