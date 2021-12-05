import './EditorDocument.css';
import React, { useCallback } from 'react';
import { Transforms, Text, Editor, Range } from 'slate';

import {
	Editable,
	RenderLeafProps,
	RenderElementProps,
	useSlateStatic,
} from 'slate-react';
import MarkFragment from './Fragments/MarkFragment';
import SentenceFragment from './Fragments/SentenceFragment';
import WordFragment from './Fragments/WordFragment';
import ImageBlock from './Blocks/Elements/Image/Image';
import WordList from './Blocks/Elements/WordList/WordList';

// Define a React component to render leaves with bold text.
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

const isBoldMarkActive = (editor: Editor): boolean => {
	const [matched] = Editor.nodes(editor, {
		match: (n) => Text.isText(n) && n.bold === true,
		universal: true,
	});
	return !!matched;
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
				<WordFragment
					attributes={attributes}
					element={element}
					// eslint-disable-next-line react/no-children-prop
					children={children}
				/>
			);
		case 'mark':
			return (
				<MarkFragment attributes={attributes} element={element}>
					{children}
				</MarkFragment>
			);
		case 'dialog':
			return (
				<div className="dialog-container" {...attributes}>
					{children}
				</div>
			);
		case 'dialogLine':
			return (
				<div className="dialog-line" {...attributes}>
					{children}
				</div>
			);
		case 'dialogLineActor':
			return (
				<div
					className="dialog-line-actor .bp3-text-overflow-ellipsis"
					{...attributes}
				>
					{children}
				</div>
			);
		case 'dialogLineSpeech':
			return (
				<div className="dialog-line-speech" {...attributes}>
					{children}
				</div>
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
		default:
			return (
				<div
					{...attributes}
					style={{ textAlign: element.align || 'left' }}
				>
					{children}
				</div>
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
		<div style={{ position: 'relative', fontSize: '1.3em' }}>
			<Editable
				className="editor-container"
				renderElement={renderElement}
				renderLeaf={renderLeaf}
				onMouseDown={(e) => {
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
				onKeyDown={(event) => {
					if (event.getModifierState('Alt')) {
						if (event.key === '&') {
							// Prevent the ampersand character from being inserted.
							event.preventDefault();
							// Execute the `insertText` method when the event occurs.
							editor.insertText('and');
						}
						if (event.key === 'b') {
							// Prevent the ampersand character from being inserted.
							event.preventDefault();
							// Execute the `insertText` method when the event occurs.
							if (isBoldMarkActive(editor)) {
								Transforms.setNodes(
									editor,
									{ bold: undefined },
									// Apply it to text nodes, and split the text node up if the
									// selection is overlapping only part of it.
									{
										match: (n) => Text.isText(n),
										split: true,
									}
								);
							} else {
								Transforms.setNodes(
									editor,
									{ bold: true },
									// Apply it to text nodes, and split the text node up if the
									// selection is overlapping only part of it.
									{
										match: (n) => Text.isText(n),
										split: true,
									}
								);
							}
						}
					}
				}}
			/>
		</div>
	);
};

export default EditorDocument;
