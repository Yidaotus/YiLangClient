import './EditorDocument.css';
import React, { useCallback } from 'react';
import { Transforms, Text, Editor } from 'slate';

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
				<p
					{...attributes}
					style={{ textAlign: element.align || 'left' }}
				>
					{children}
				</p>
			);
	}
};

const EditorDocument: React.FC = () => {
	const renderLeaf = useCallback((props) => {
		return <Leaf {...props} />;
	}, []);

	const renderElement = useCallback((props) => <Element {...props} />, []);
	const editor = useSlateStatic();

	/*
	const vocab = useMemo(() => {
		const vocabs: Set<string> = new Set();

		if (editorNodes.length > 0) {
			const vocabNodes = Editor.nodes(editor, {
				match: (n) => SlateElement.isElement(n) && n.type === 'word',
				at: [[0], [editor.children.length - 1]],
			});
			if (vocabNodes) {
				for (const [vocabNode] of vocabNodes) {
					vocabs.add(SlateNode.string(vocabNode));
				}
			}
		}

		return vocabs;
	}, [editor, editorNodes.length]);

	const sentences = useMemo(() => {
		const sentencesInEditor: Array<string> = [];
		for (const currentNode of editorNodes) {
			const sentenceFragments = SlateNode.elements(currentNode, {
				pass: ([node]) =>
					SlateElement.isElement(node) && node.type === 'sentence',
			});

			if (sentenceFragments) {
				for (const [sentenceFragment] of sentenceFragments) {
					if (
						SlateElement.isElement(sentenceFragment) &&
						sentenceFragment.type === 'sentence'
					) {
						sentencesInEditor.push(
							SlateNode.string(sentenceFragment)
						);
					}
				}
			}
		}
		return sentencesInEditor;
	}, [editorNodes]);
	*/

	return (
		<div style={{ position: 'relative', fontSize: '1.3em' }}>
			<Editable
				className="editor-container"
				renderElement={renderElement}
				renderLeaf={renderLeaf}
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
