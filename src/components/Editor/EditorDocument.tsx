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
} from 'slate-react';
import { addWordToDictionary } from '@store/dictionary/actions';
import { IRootDispatch } from '@store/index';
import { useDispatch } from 'react-redux';
import { CustomElement, SentenceElement, VocabElement } from './CustomEditor';
import Toolbar from './Toolbar/Toolbar';
import MarkFragment from './Fragments/MarkFragment';
import DictPopupController from './Popups/DictPopupController';
import BlockContainer from './Blocks/BlockContainer/BlockContainer';
import WordFragmentController from './Fragments/WordFragmentController';
import SentenceFragment from './Fragments/SentenceFragment';

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

const withYiLang = (editor: Editor) => {
	const { isInline, isVoid } = editor;
	const availableElementTypes: Array<CustomElement['type']> = [
		'vocab',
		'mark',
		'sentence',
	];

	// eslint-disable-next-line no-param-reassign
	editor.isInline = (element) => {
		return availableElementTypes.includes(element.type)
			? true
			: isInline(element);
	};

	// eslint-disable-next-line no-param-reassign
	editor.isVoid = (element) => {
		return element.type === 'vocab' ? true : isVoid(element);
	};

	return editor;
};

const insertSentence = (editor: Editor, translation: string) => {
	Transforms.unwrapNodes(editor, {
		match: (n) => {
			return SlateElement.isElement(n) && n.type === 'sentence';
		},
	});

	const vocab: SentenceElement = {
		type: 'sentence',
		translation,
		children: [{ text: '' }],
	};
	Transforms.wrapNodes(editor, vocab, { split: true });
	Transforms.collapse(editor, { edge: 'end' });
};

const insertVocab = (editor: Editor, wordId: string) => {
	const vocab: VocabElement = {
		type: 'vocab',
		wordId,
		children: [{ text: '' }],
	};
	Transforms.wrapNodes(editor, vocab, { split: true });
};

const Element = (props: RenderElementProps) => {
	const { children, attributes, element } = props;
	switch (element.type) {
		case 'sentence':
			return (
				<SentenceFragment
					// eslint-disable-next-line react/no-children-prop
					children={children}
					attributes={attributes}
					element={element}
				/>
			);
		case 'vocab':
			return (
				<WordFragmentController
					// eslint-disable-next-line react/no-children-prop
					children={children}
					attributes={attributes}
					element={element}
				/>
			);
		case 'mark':
			return (
				<MarkFragment
					// eslint-disable-next-line react/no-children-prop
					children={children}
					attributes={attributes}
					element={element}
				/>
			);
		default:
			return <BlockContainer renderProps={props} fontSize={1.2} />;
	}
};

const App: React.FC = () => {
	const ref = useRef(null);
	const editor = useMemo(() => withYiLang(withReact(createEditor())), []);
	// Add the initial value when setting up our state.

	const [editorNodes, setEditorNodes] = useState<Descendant[]>([
		{
			type: 'paragraph',
			children: [{ text: 'A line of text in a paragraph.' }],
		},
	]);
	const dispatch: IRootDispatch = useDispatch();

	const renderLeaf = useCallback((props) => {
		return <Leaf {...props} />;
	}, []);

	const renderElement = useCallback((props) => <Element {...props} />, []);

	const vocab = useMemo(() => {
		const vocabs: Array<string> = [];

		if (editorNodes.length > 0) {
			const vocabNodes = Editor.nodes(editor, {
				match: (n) => SlateElement.isElement(n) && n.type === 'vocab',
				at: [[0], [editor.children.length - 1]],
			});
			if (vocabNodes) {
				for (const [vocabNode] of vocabNodes) {
					vocabs.push(SlateNode.string(vocabNode));
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

	return (
		<div style={{ position: 'relative', fontSize: '1.3em' }} ref={ref}>
			<Slate
				editor={editor}
				value={editorNodes}
				onChange={(newValue) => setEditorNodes(newValue)}
			>
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
									if (event.key === 'a') {
										if (editor.selection) {
											event.preventDefault();
											const root = Editor.string(
												editor,
												editor.selection,
												{ voids: true }
											);
											const dictEntry = {
												createdAt: new Date(),
												// eslint-disable-next-line react/destructuring-assignment
												key: root,
												lang: 'jp',
												tags: [],
												translations: ['lul'],
											};
											const wordId = dispatch(
												addWordToDictionary(dictEntry)
											);
											if (wordId) {
												insertVocab(editor, wordId);
											}
										}
									}
									if (event.key === 's') {
										event.preventDefault();
										insertSentence(editor, 'test sentence');
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
													match: (n) =>
														Text.isText(n),
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
													match: (n) =>
														Text.isText(n),
													split: true,
												}
											);
										}
									}
								}
							}}
						/>
					</div>
					<div>
						<h1>Sentence</h1>
						<ul>
							{sentences.map((sentence) => (
								<li>{sentence}</li>
							))}
						</ul>
						<h1>Vocab</h1>
						<ul>
							{vocab.map((v) => (
								<li>{v}</li>
							))}
						</ul>
						<h1>Value</h1>
						<pre>{JSON.stringify(editorNodes, null, 2)}</pre>
						<h1>State</h1>
						<pre>{JSON.stringify(editor.children, null, 2)}</pre>
						<h1>Operations</h1>
						<pre>{JSON.stringify(editor.operations, null, 2)}</pre>
					</div>
				</div>
			</Slate>
		</div>
	);
};

export default App;
