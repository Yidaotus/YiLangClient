import DictionaryEntryRow from '@components/DictionaryEntry/DictionaryEntryRow';
import {
	CustomEditor,
	EditorElement,
	SentenceElement,
	WordElement,
} from '@components/Editor/YiEditor';
import {
	Accordion,
	AccordionSummary,
	Typography,
	AccordionDetails,
	TableContainer,
	Paper,
	Table,
	TableBody,
	AccordionActions,
	Button,
} from '@mui/material';
import {
	ExpandMore as ExpandMoreIcon,
	Save as SaveIcon,
} from '@mui/icons-material';
import React, { useCallback } from 'react';
import {
	NodeEntry,
	Path,
	Transforms,
	Element as SlateElement,
	Node as SlateNode,
} from 'slate';
import { ReactEditor } from 'slate-react';
import {
	resolveEntryIdsAndExport,
	resolveSentenceIdsAndExport,
} from '@helpers/CSVExporter';
import { useActiveLanguageConf } from '@hooks/ConfigQueryHooks';
import DictionarySentenceRow from '@components/DictionaryEntry/DictionarySentenceRow';

interface WordListTableProps {
	editor: CustomEditor;
}

const WordListTable: React.FC<WordListTableProps> = ({ editor }) => {
	const activeLanguage = useActiveLanguageConf();

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

	const scrollToPath = useCallback(
		(path: Path) => {
			setTimeout(() => {
				Transforms.select(editor, path);
				if (editor.selection) {
					const domNode = ReactEditor.toDOMRange(
						editor,
						editor.selection
					);
					const parentElement =
						domNode.commonAncestorContainer.parentElement;
					if (parentElement) {
						parentElement.scrollIntoView({
							behavior: 'smooth',
							block: 'center',
						});
						parentElement.click();
					}
				}
			});
		},
		[editor]
	);

	return (
		<>
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
										key={`${vocab.dictId}-${path.join('')}`}
										path={path}
										scrollToPath={scrollToPath}
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
							resolveEntryIdsAndExport(
								vocabs.map(([vocab]) => vocab.dictId),
								activeLanguage?.id || ''
							);
						}}
						endIcon={<SaveIcon />}
						variant="contained"
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
								{sentences.map(
									([sentenceNode, sentencePath]) => (
										<DictionarySentenceRow
											id={sentenceNode.sentenceId}
											path={sentencePath}
											scrollToPath={scrollToPath}
										/>
									)
								)}
							</TableBody>
						</Table>
					</TableContainer>
					{sentences.length < 1 && (
						<span>No sentences added yet!</span>
					)}
					<AccordionActions>
						<Button
							onClick={() => {
								resolveSentenceIdsAndExport(
									sentences.map(
										(sentenceNode) =>
											sentenceNode[0].sentenceId
									),
									activeLanguage?.id || ''
								);
							}}
							endIcon={<SaveIcon />}
							variant="contained"
						>
							Export
						</Button>
					</AccordionActions>
				</AccordionDetails>
			</Accordion>
		</>
	);
};

/**
 * Rendering this Table is a serious bottleneck. The easiest way is
 * to just rerender when we remove or insert word/sentences elements.
 * TODO: Extract this to a hook or component to reuse in other components
 */
export default React.memo(
	WordListTable,
	(_, nextProps) =>
		!!!nextProps.editor.operations.some(
			(op) =>
				(op.type === 'insert_node' || op.type === 'remove_node') &&
				((op.node as EditorElement).type === 'sentence' ||
					(op.node as EditorElement).type === 'word')
		)
);
