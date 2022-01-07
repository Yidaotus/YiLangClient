import './WordList.css';
import DictionaryEntryRow from '@components/DictionaryEntry/DictionaryEntryRow';
import { SentenceElement, WordElement } from '@components/Editor/YiEditor';
import React from 'react';
import {
	Element as SlateElement,
	Node as SlateNode,
	NodeEntry,
	Path,
	Transforms,
} from 'slate';
import {
	ReactEditor,
	RenderElementProps,
	useSelected,
	useSlate,
} from 'slate-react';
import {
	Link as LinkIcon,
	ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import {
	Accordion,
	AccordionDetails,
	AccordionActions,
	AccordionSummary,
	Box,
	Button,
	IconButton,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableRow,
	Typography,
} from '@mui/material';

const WordList: React.FC<RenderElementProps> = ({ children, attributes }) => {
	const editor = useSlate();
	const selected = useSelected();

	const vocabs: Array<[WordElement, Path]> = [];
	const sentences: Array<[SentenceElement, Path]> = [];

	const vocabNodes = SlateNode.elements(editor, {
		pass: (n): n is NodeEntry<WordElement> =>
			SlateElement.isElement(n) &&
			n.type === 'word' &&
			n.isUserInput === true,
	});

	const sentenceNodes = SlateNode.elements(editor, {
		pass: (n): n is NodeEntry<SentenceElement> =>
			SlateElement.isElement(n) && n.type === 'sentence',
	});

	if (vocabNodes) {
		for (const vocabNode of vocabNodes) {
			if (vocabNode[0].type === 'word' && vocabNode[0].isUserInput) {
				vocabs.push([vocabNode[0], vocabNode[1]]);
			}
		}
	}

	if (sentenceNodes) {
		for (const sentenceNode of sentenceNodes) {
			if (sentenceNode[0].type === 'sentence') {
				sentences.push([sentenceNode[0], sentenceNode[1]]);
			}
		}
	}

	return (
		<Box
			{...attributes}
			onDragStart={(e) => {
				e.preventDefault();
			}}
			style={{
				padding: '5px',
				borderRadius: '5px',
			}}
		>
			{children}
			<div contentEditable={false} style={{ fontSize: '0.95rem' }}>
				<Accordion>
					<AccordionSummary
						expandIcon={<ExpandMoreIcon />}
						aria-controls="added-words-content"
						id="added-words-header"
					>
						<Typography>Added Words</Typography>
					</AccordionSummary>
					<AccordionDetails>
						<TableContainer component={Paper}>
							<Table
								sx={{ minWidth: 650 }}
								aria-label="simple table"
								size="small"
							>
								<TableBody>
									{vocabs.map(([vocab, path]) => (
										<DictionaryEntryRow
											entryId={vocab.dictId}
											key={vocab.dictId}
											path={path}
											editor={editor}
										/>
									))}
								</TableBody>
							</Table>
						</TableContainer>
						{vocabs.length < 1 && (
							<Typography>No words added yet!</Typography>
						)}
					</AccordionDetails>
					<AccordionActions>
						<Button
							onClick={() => {
								const csv = 'test123';
								const element = document.createElement('a');
								const file = new Blob([csv], {
									type: 'text/plain',
								});
								element.href = URL.createObjectURL(file);
								element.download = 'myFile.txt';
								document.body.appendChild(element);
								element.click();
								document.body.removeChild(element);
							}}
						>
							Export
						</Button>
					</AccordionActions>
				</Accordion>
				<Accordion>
					<AccordionSummary
						expandIcon={<ExpandMoreIcon />}
						aria-controls="added-sentences-content"
						id="added-sentences-header"
					>
						<Typography>Added Sentences</Typography>
					</AccordionSummary>
					<AccordionDetails>
						<TableContainer component={Paper}>
							<Table
								sx={{ minWidth: 650 }}
								aria-label="simple table"
								size="small"
							>
								<TableBody>
									{sentences.map(([sentence, spath]) => (
										<TableRow
											key={sentence.sentenceId}
											sx={{
												'&:last-child td, &:last-child th':
													{ border: 0 },
											}}
										>
											<TableCell
												component="th"
												scope="row"
											>
												<Typography>
													{SlateNode.string(sentence)}
												</Typography>
											</TableCell>
											<TableCell
												component="th"
												scope="row"
											>
												<Typography>
													{sentence.translation}
												</Typography>
											</TableCell>
											<TableCell
												component="th"
												scope="row"
											>
												<IconButton
													size="small"
													onMouseUp={(e) => {
														setTimeout(() => {
															Transforms.select(
																editor,
																spath
															);
															if (
																editor.selection
															) {
																const domNode =
																	ReactEditor.toDOMRange(
																		editor,
																		editor.selection
																	);
																domNode.commonAncestorContainer.parentElement?.scrollIntoView(
																	{
																		behavior:
																			'smooth',
																		block: 'center',
																	}
																);
															}
														});
														e.preventDefault();
													}}
												>
													<LinkIcon />
												</IconButton>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</TableContainer>
						{sentences.length < 1 && (
							<span>No sentences added yet!</span>
						)}
					</AccordionDetails>
				</Accordion>
			</div>
		</Box>
	);
};

export default WordList;
