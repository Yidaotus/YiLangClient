import './WordList.css';
import DictionaryEntryRow from '@components/DictionaryEntry/DictionaryEntryRow';
import { SentenceElement, WordElement } from '@components/Editor/CustomEditor';
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
import { Button } from 'antd';
import { LinkOutlined } from '@ant-design/icons';

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
		<div
			{...attributes}
			onDragStart={(e) => {
				e.preventDefault();
			}}
			style={{
				backgroundColor: selected ? '#92837410' : 'inherit',
				padding: '5px',
				borderRadius: '5px',
			}}
		>
			{children}
			<div contentEditable={false} style={{ fontSize: '0.95rem' }}>
				<h3 className="bp3-heading">Added Words</h3>
				{vocabs.map(([v, path]) => (
					<div className="dictentry-row-wrapper" key={v.dictId}>
						<DictionaryEntryRow
							entryId={v.dictId}
							key={v.dictId}
							path={path}
							editor={editor}
						/>
					</div>
				))}
				{vocabs.length < 1 && <span>No words added yet!</span>}
				<h3 className="bp3-heading">Added Sentences</h3>
				{sentences.map(([s, spath]) => (
					<div className="sentence-row" key={s.sentenceId}>
						<p>{SlateNode.string(s)}</p>
						<p>{s.translation}</p>
						<Button
							className="dictentry-col"
							shape="circle"
							size="small"
							type="ghost"
							onMouseUp={(e) => {
								setTimeout(() => {
									Transforms.select(editor, spath);
									if (editor.selection) {
										const domNode = ReactEditor.toDOMRange(
											editor,
											editor.selection
										);
										domNode.commonAncestorContainer.parentElement?.scrollIntoView(
											{
												behavior: 'smooth',
												block: 'center',
											}
										);
									}
								});
								e.preventDefault();
							}}
							icon={<LinkOutlined />}
						/>
					</div>
				))}

				{sentences.length < 1 && <span>No sentences added yet!</span>}
			</div>
		</div>
	);
};

export default WordList;
