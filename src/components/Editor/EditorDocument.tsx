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
import { CustomElement } from './CustomEditor';
import Toolbar from './Toolbar/Toolbar';
import MarkFragment from './Fragments/MarkFragment';
import DictPopupController from './Popups/DictPopupController';
import SentenceFragment from './Fragments/SentenceFragment';
import WordFragment from './Fragments/WordFragment';

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
	const inlineTypes: Array<CustomElement['type']> = [
		'word',
		'mark',
		'sentence',
		'highlight',
		'inline-image',
	];

	const voidTypes: Array<CustomElement['type']> = ['word', 'inline-image'];

	// eslint-disable-next-line no-param-reassign
	editor.isInline = (element) => {
		return inlineTypes.includes(element.type) ? true : isInline(element);
	};

	// eslint-disable-next-line no-param-reassign
	editor.isVoid = (element) => {
		return voidTypes.includes(element.type) ? true : isVoid(element);
	};

	return editor;
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
					contentEditable
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
		case 'inline-image':
			return (
				<span {...attributes}>
					{children}
					<img
						src={element.src}
						style={{ float: 'right', userSelect: 'none' }}
						alt="test"
					/>
				</span>
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
	const editor = useMemo(() => withYiLang(withReact(createEditor())), []);

	const [editorNodes, setEditorNodes] = useState<Descendant[]>([
		{
			type: 'head',
			level: 1,
			children: [
				{
					text: 'イチゴの中はどうなっている？',
				},
			],
		},
		{
			type: 'head',
			level: 2,
			children: [
				{
					text: 'イチゴの中はどうなっている？',
				},
			],
		},
		{
			type: 'paragraph',
			children: [
				{
					text: '今回のミカタは「中を見てみる」。イチゴの中はどうなっているか、街の人に聞いてみました。まず、男の子。「こんな感じだ と思います。まわりが赤くなって、中に粒（つぶ）がある」。中にツブツブ？　続いて女の子。',
				},
				{
					type: 'inline-image',
					src: 'https://www.nhk.or.jp/das/image/D0005110/D0005110342_00000_C_001.jpg',
					children: [{ text: '' }],
				},
				{
					text: '真ん中が白っぽくて空洞（くうどう）になっていて、まわりは赤い」。中に空洞？　若い女の人は、「真ん中が真っ白で、徐々（じょじょ）に赤くなっていく感じ」。真ん中は白い？　みんながかいたイチゴの中。中にツブツブ、中に空洞、真ん中が白い、スジがある…。実際はどうなっているのでしょう。',
				},
			],
		},
	]);

	const renderLeaf = useCallback((props) => {
		return <Leaf {...props} />;
	}, []);

	const renderElement = useCallback((props) => <Element {...props} />, []);

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
								<li key={sentence}>{sentence}</li>
							))}
						</ul>
						<h1>Vocab</h1>
						<ul>
							{[...vocab.values()].map((v) => (
								<li key={v}>{v}</li>
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

export default EditorDocument;
