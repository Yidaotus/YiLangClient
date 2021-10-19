import React, { useMemo } from 'react';
import { Editor, Element as SlateElement, Node as SlateNode } from 'slate';
import { useSlate } from 'slate-react';

const WordsPanel: React.FC = () => {
	const editor = useSlate();

	const vocabs: Set<string> = new Set();

	const vocabNodes = Editor.nodes(editor, {
		match: (n) => SlateElement.isElement(n) && n.type === 'word',
		at: [[0], [editor.children.length - 1]],
	});
	if (vocabNodes) {
		for (const [vocabNode] of vocabNodes) {
			vocabs.add(SlateNode.string(vocabNode));
		}
	}

	return <div>{[...vocabs].map((v) => v)}</div>;
};

export default WordsPanel;
