import DictionaryEntry from '@components/DictionaryEntry/DictionaryEntry';
import { IRootState } from '@store/index';
import { IDictionaryEntryResolved } from 'Document/Dictionary';
import { notUndefined } from 'Document/Utility';
import React from 'react';
import { useSelector } from 'react-redux';
import { Editor, Element as SlateElement } from 'slate';
import { useSlate } from 'slate-react';
import { WordElement } from '../CustomEditor';

const WordsPanel: React.FC = () => {
	const editor = useSlate();
	const vocabs: Array<IDictionaryEntryResolved> = [];
	const userDictionary = useSelector((state: IRootState) => state.dictionary);

	const vocabNodes = Editor.nodes(editor, {
		match: (n) => SlateElement.isElement(n) && n.type === 'word',
		at: [[0], [editor.children.length - 1]],
	});

	if (vocabNodes) {
		for (const [vocabNode] of vocabNodes) {
			const { dictId } = vocabNode as WordElement;
			const entryInDictionary = userDictionary.entries[dictId];
			if (entryInDictionary) {
				vocabs.push({
					...entryInDictionary,
					tags: entryInDictionary.tags
						.map((tagId) => userDictionary.tags[tagId])
						.filter(notUndefined),
				});
			}
		}
	}

	return (
		<div>
			{[...vocabs].map((v) => (
				<DictionaryEntry entry={v} />
			))}
		</div>
	);
};

export default WordsPanel;
