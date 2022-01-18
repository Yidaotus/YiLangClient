import './EditorDocument.css';
import React, { useCallback } from 'react';
import { Transforms, Range } from 'slate';
import {
	Editable,
	RenderLeafProps,
	RenderElementProps,
	useSlateStatic,
} from 'slate-react';
import MarkFragment from './Fragments/Mark/MarkFragment';
import SentenceFragment from './Fragments/Sentence/SentenceFragment';
import WordFragment from './Fragments/Word/WordFragment';
import ImageBlock from './Blocks/Image/Image';
import WordList from './Blocks/WordList/WordList';
import VideoBlock, { videoBlockPasteAction } from './Blocks/Video/Video';
import { Avatar, Box, Grid, Paper, Typography } from '@mui/material';

const Leaf = ({ attributes, leaf, children }: RenderLeafProps) => {
	return (
		<span
			{...attributes}
			style={{
				fontWeight: leaf.bold ? 'bold' : 'normal',
				color: leaf.color,
			}}
		>
			{children}
		</span>
	);
};

const Element = (props: RenderElementProps) => {
	const { children, attributes, element } = props;
	switch (element.type) {
		case 'sentence':
			return (
				<SentenceFragment attributes={attributes} element={element}>
					{children}
				</SentenceFragment>
			);
		case 'documentTitle': {
			return (
				<Typography
					sx={(theme) => ({
						borderBottom: `5px solid ${theme.palette.secondary.light}`,
						m: 2,
					})}
					variant="h3"
					component="div"
					{...attributes}
				>
					{children}
				</Typography>
			);
		}
		case 'title': {
			return (
				<h1
					{...attributes}
					style={{ textAlign: element.align || 'left' }}
				>
					{children}
				</h1>
			);
		}
		case 'subtitle': {
			return (
				<h2
					{...attributes}
					style={{ textAlign: element.align || 'left' }}
				>
					{children}
				</h2>
			);
		}
		case 'highlight':
			return element.role === 'highlight' ? (
				<span
					style={{ color: 'black' }}
					{...attributes}
					contentEditable={false}
				>
					{children}
				</span>
			) : (
				<span
					style={{ color: 'lightgray' }}
					{...attributes}
					contentEditable={false}
				>
					{children}
				</span>
			);
		case 'image':
			return (
				<ImageBlock attributes={attributes} element={element}>
					{children}
				</ImageBlock>
			);
		case 'word':
			return (
				<WordFragment attributes={attributes} element={element}>
					{children}
				</WordFragment>
			);
		case 'mark':
			return (
				<MarkFragment attributes={attributes} element={element}>
					{children}
				</MarkFragment>
			);
		case 'dialog':
			return (
				<Paper
					sx={{
						display: 'flex',
						flexDirection: 'column',
						borderRadius: '3px',
						m: 2,
						p: 1,
					}}
					{...attributes}
				>
					{children}
				</Paper>
			);
		case 'dialogLine':
			return (
				<Box
					sx={(theme) => ({
						wordBreak: 'break-all',
						whiteSpace: 'pre-wrap',
						'&:nth-child(2n)': {
							backgroundColor: theme.palette.secondary.light,
							borderRadius: '2px',
						},
					})}
					{...attributes}
				>
					{children}
				</Box>
			);
		case 'dialogLineActor':
			return (
				<Box
					sx={{
						display: 'flex',
						alignItems: 'center',
						p: 1,
						'& span': {
							fontWeight: 'bold',
						},
					}}
					{...attributes}
				>
					<div
						style={{
							userSelect: 'none',
							display: 'flex',
							alignItems: 'center',
						}}
						contentEditable="false"
					>
						<Avatar
							sx={{ width: 24, height: 24, marginRight: 1 }}
						/>
					</div>
					{children}
				</Box>
			);
		case 'dialogLineSpeech':
			return (
				<Grid
					item
					xs="auto"
					sx={{
						paddingBottom: 1,
						paddingLeft: 1,
					}}
					{...attributes}
				>
					{children}
				</Grid>
			);
		case 'listItem':
			return <li {...attributes}>{children}</li>;
		case 'numberedList':
			return <ol {...attributes}>{children}</ol>;
		case 'bulletedList':
			return <ul {...attributes}>{children}</ul>;
		case 'wordList':
			return (
				<WordList attributes={attributes} element={element}>
					{children}
				</WordList>
			);
		case 'blockQuote':
			return (
				<blockquote
					{...attributes}
					style={{ textAlign: element.align || 'left' }}
				>
					{children}
				</blockquote>
			);
		case 'video':
			return (
				<VideoBlock attributes={attributes} element={element}>
					{children}
				</VideoBlock>
			);
		default:
			return (
				<Box
					{...attributes}
					sx={{ textAlign: element.align || 'left', p: 1 }}
				>
					{children}
				</Box>
			);
	}
};

const EditorDocument: React.FC = () => {
	const renderLeaf = useCallback((props) => {
		return <Leaf {...props} />;
	}, []);
	const renderElement = useCallback((props) => <Element {...props} />, []);
	const editor = useSlateStatic();

	return (
		<div style={{ position: 'relative', fontSize: '1.1em' }}>
			<Editable
				onPaste={(event) => {
					videoBlockPasteAction(event, editor);
				}}
				className="editor-container"
				renderElement={renderElement}
				renderLeaf={renderLeaf}
				onMouseDown={() => {
					if (
						editor.selection &&
						!Range.isCollapsed(editor.selection)
					) {
						if (
							editor.operations[editor.operations.length - 1]
								?.type !== 'set_selection'
						) {
							Transforms.collapse(editor);
						}
					}
				}}
			/>
		</div>
	);
};

export default EditorDocument;
