import './EditorDocument.css';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
	createEditor,
	Descendant,
	Transforms,
	Text,
	Editor,
	Element as SlateElement,
	Node as SlateNode,
} from 'slate';

import {
	Slate,
	Editable,
	withReact,
	RenderLeafProps,
	RenderElementProps,
	useSlateStatic,
} from 'slate-react';
import { CustomElement } from './CustomEditor';
import Toolbar from './Toolbar/Toolbar';
import MarkFragment from './Fragments/MarkFragment';
import DictPopupController from './Popups/DictPopupController';
import SentenceFragment from './Fragments/SentenceFragment';
import WordFragment from './Fragments/WordFragment';
import ImageBlock from './Blocks/Elements/Image/Image';

// Define a React component to render leaves with bold text.
const Leaf = ({ attributes, leaf, children }: RenderLeafProps) => {
	return (
		<span
			{...attributes}
			style={{ fontWeight: leaf.bold ? 'bold' : 'normal' }}
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
		case 'head': {
			switch (element.level) {
				case 1:
					return <h1 {...attributes}>{children}</h1>;
				case 2:
					return <h2 {...attributes}>{children}</h2>;
				default:
					return <h1 {...attributes}>{children}</h1>;
			}
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
		default:
			return <div {...attributes}>{children}</div>;
	}
};

const EditorDocument: React.FC = () => {
	const ref = useRef(null);

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
		<div style={{ position: 'relative', fontSize: '1.3em' }} ref={ref}>
			<Toolbar rootElement={ref} />
			<DictPopupController rootElement={ref} />
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
				}}
			>
				<div>
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
			</div>
		</div>
	);
};

export default EditorDocument;
