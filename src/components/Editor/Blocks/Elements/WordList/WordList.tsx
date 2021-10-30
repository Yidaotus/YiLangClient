import DictionaryEntry from '@components/DictionaryEntry/DictionaryEntry';
import { WordElement } from '@components/Editor/CustomEditor';
import React, { useEffect, useState } from 'react';
import {
	Editor,
	Element as SlateElement,
	Node as SlateNode,
	NodeEntry,
} from 'slate';
import { RenderElementProps, useSlate } from 'slate-react';

const WordList: React.FC<RenderElementProps> = ({ children, attributes }) => {
	const editor = useSlate();

	const vocabs: Array<WordElement> = [];
	const vocabNodes = SlateNode.elements(editor, {
		pass: (n): n is NodeEntry<WordElement> =>
			SlateElement.isElement(n) &&
			n.type === 'word' &&
			n.isUserInput === true,
	});
	if (vocabNodes) {
		for (const [vocabNode] of vocabNodes) {
			if (vocabNode.type === 'word' && vocabNode.isUserInput) {
				vocabs.push(vocabNode);
			}
		}
	}

	return (
		<span {...attributes}>
			{children}
			{vocabs.map((v) => (
				<DictionaryEntry entryId={v.dictId} key={v.dictId} />
			))}
		</span>
	);
};

export default WordList;
