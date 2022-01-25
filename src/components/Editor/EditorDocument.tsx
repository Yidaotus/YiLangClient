import './EditorDocument.css';
import React, { useCallback } from 'react';
import {
	Transforms,
	Range,
	Editor,
	Element as SlateElement,
	Node as SlateNode,
	NodeEntry,
} from 'slate';
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
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Paragraph from './Blocks/Paragraph/Paragraph';
import Dialog from './Blocks/Dialog/Dialog';
import DialogLine from './Blocks/Dialog/DialogLine';
import DocumentTitle from './Blocks/DocumentTitle/DocumentTitle';
import NumberedList from './Blocks/List/NumberedList';
import BulletedList from './Blocks/List/BulletedList';
import Title from './Blocks/Title/Title';

const Leaf = ({ attributes, leaf, children }: RenderLeafProps) => {
	return (
		<span
			{...attributes}
			style={{
				fontWeight: leaf.bold ? 'bold' : 'normal',
				color: leaf.color,
			}}
		>
			{leaf.placeholder && (
				<span
					style={{
						position: 'absolute',
						opacity: 0.3,
						userSelect: 'none',
						pointerEvents: 'none',
					}}
					contentEditable={false}
				>
					Type something
				</span>
			)}
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
				<DocumentTitle attributes={attributes} element={element}>
					{children}
				</DocumentTitle>
			);
		}
		case 'title': {
			return (
				<Title attributes={attributes} element={element}>
					{children}
				</Title>
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
				<Dialog attributes={attributes} element={element}>
					{children}
				</Dialog>
			);
		case 'dialogLine':
			return (
				<DialogLine attributes={attributes} element={element}>
					{children}
				</DialogLine>
			);
		case 'listItem':
			return <li {...attributes}>{children}</li>;
		case 'numberedList':
			return (
				<NumberedList attributes={attributes} element={element}>
					{children}
				</NumberedList>
			);
		case 'bulletedList':
			return (
				<BulletedList attributes={attributes} element={element}>
					{children}
				</BulletedList>
			);
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
				<Paragraph element={element} attributes={attributes}>
					{children}
				</Paragraph>
			);
	}
};

const EditorDocument: React.FC = () => {
	const renderLeaf = useCallback((props) => {
		return <Leaf {...props} />;
	}, []);
	const renderElement = useCallback((props) => <Element {...props} />, []);
	const editor = useSlateStatic();

	const decorate = useCallback(
		(entry: NodeEntry<SlateNode>) => {
			const [node, path] = entry;
			const hasParent = path.length > 1;
			let isDocumentTitle = false;
			if (hasParent) {
				const parent = SlateNode.get(editor, [path[0]]);
				isDocumentTitle =
					SlateElement.isElement(parent) &&
					parent.type === 'documentTitle';
			} else {
				isDocumentTitle =
					SlateElement.isElement(node) &&
					node.type === 'documentTitle';
			}
			if (editor.selection != null) {
				if (
					!Editor.isEditor(node) &&
					!Editor.isVoid(editor, node) &&
					Editor.string(editor, [path[0]]) === '' &&
					Range.includes(editor.selection, path) &&
					Range.isCollapsed(editor.selection) &&
					!isDocumentTitle
				) {
					return [
						{
							...editor.selection,
							placeholder: true,
						},
					];
				}
			}
			return [];
		},
		[editor]
	);

	const onMouseDown = useCallback(() => {
		if (editor.selection && !Range.isCollapsed(editor.selection)) {
			if (
				editor.operations[editor.operations.length - 1]?.type !==
				'set_selection'
			) {
				Transforms.collapse(editor);
			}
		}
	}, [editor]);

	return (
		<div
			style={{
				position: 'relative',
				fontSize: '1.1em',
			}}
		>
			<DndProvider backend={HTML5Backend}>
				<Editable
					onPaste={(event) => {
						videoBlockPasteAction(event, editor);
					}}
					className="editor-container"
					renderElement={renderElement}
					renderLeaf={renderLeaf}
					onMouseDown={onMouseDown}
					decorate={decorate}
					draggable={false}
					onDrop={() => {
						return true;
					}}
				/>
			</DndProvider>
		</div>
	);
};

export default React.memo(EditorDocument);
