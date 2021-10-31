import DictionaryEntry from '@components/DictionaryEntry/DictionaryEntry';
import DictionaryEntryRow from '@components/DictionaryEntry/DictionaryEntryRow';
import { WordElement } from '@components/Editor/CustomEditor';
import { Button } from 'antd';
import React from 'react';
import {
	Editor,
	Element as SlateElement,
	ElementEntry,
	Node as SlateNode,
	NodeEntry,
	Path,
	Transforms,
} from 'slate';
import { RenderElementProps, useSlate } from 'slate-react';

const WordList: React.FC<RenderElementProps> = ({ children, attributes }) => {
	const editor = useSlate();

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
		<div {...attributes}>
			{children}
			<div contentEditable={false}>
				<h2>Words:</h2>
				{vocabs.map(([v, path]) => (
					<div className="dictentry-row-wrapper">
						<DictionaryEntryRow
							entryId={v.dictId}
							key={v.dictId}
							path={path}
							editor={editor}
						/>
					</div>
				))}
			</div>
		</div>
	);
};

export default WordList;
