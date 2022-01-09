import React, { useRef, useState } from 'react';
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
import { ExpandMore as ExpandMoreIcon, StarRounded } from '@mui/icons-material';
import {
	NodeEntry,
	Path,
	Node as SlateNode,
	Element as SlateElement,
} from 'slate';
import { CustomEditor, EditorElement, WordElement } from '../YiEditor';
import BasicSRS from './BasicSRS';

const StyledAccordion = styled(Accordion)(() => ({
	'& .MuiAccordionSummary-root.Mui-expanded': {
		minHeight: '48px',
		height: '48px',
	},
}));

const DraggableSRS: React.FC<{ editor: CustomEditor }> = ({ editor }) => {
	const isDragging = useRef(false);
	const [expanded, setExpanded] = useState(false);

	const vocabs: Array<[WordElement, Path]> = [];
	const vocabNodes = SlateNode.elements(editor, {
		pass: (n): n is NodeEntry<WordElement> =>
			SlateElement.isElement(n) &&
			n.type === 'word' &&
			n.isUserInput === true,
	});
	if (vocabNodes) {
		for (const vocabNode of vocabNodes) {
			if (vocabNode[0].type === 'word' && vocabNode[0].isUserInput) {
				vocabs.push([vocabNode[0], vocabNode[1]]);
			}
		}
	}

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
			>
				<Paper elevation={2}>
					<StyledAccordion expanded={expanded}>
						<AccordionSummary
							sx={(theme) => ({
								backgroundColor: theme.palette.secondary.light,
							})}
							expandIcon={<ExpandMoreIcon />}
							aria-controls="sls-content"
							style={{ cursor: 'move' }}
							id="draggable-srs-title"
							onClick={() => {
								if (!isDragging.current) {
									setExpanded(!expanded);
								}
							}}
						>
							<Box sx={{ display: 'flex', alignItems: 'center' }}>
								<StarRounded sx={{ paddingRight: 1 }} />
								<Typography>SRS</Typography>
							</Box>
						</AccordionSummary>
						<AccordionDetails>
							<BasicSRS
								entryIds={vocabs.map(
									([wordNode]) => wordNode.dictId
								)}
							/>
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
