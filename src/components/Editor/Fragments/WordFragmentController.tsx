import React from 'react';
import { IRootState, StoreMap } from '@store/index';
import {
	IDictionaryEntry,
	IDictionaryEntryResolved,
	IDictionaryTag,
} from 'Document/Dictionary';
import { notUndefined } from 'Document/Utility';
import { useSelector } from 'react-redux';
import { RenderElementProps } from 'slate-react';
import { VocabElement } from '../CustomEditor';
import WordFragment from './WordFragment';

export type WordFragmentControllerProps = Omit<
	RenderElementProps,
	'element'
> & { element: VocabElement };
const WordFragmentController: React.FC<WordFragmentControllerProps> = ({
	children,
	element,
	attributes,
}) => {
	const userDictionary = useSelector<IRootState, StoreMap<IDictionaryEntry>>(
		(state) => state.dictionary.entries
	);

	const userTags = useSelector<IRootState, StoreMap<IDictionaryTag>>(
		(state) => state.dictionary.tags
	);

	let resolvedDictEntry: IDictionaryEntryResolved | null = null;
	const dictEntry = userDictionary[element.wordId];
	const entryTags =
		dictEntry?.tags.map((id) => userTags[id]).filter(notUndefined) || [];
	if (dictEntry && entryTags) {
		resolvedDictEntry = {
			...dictEntry,
			root: undefined,
			tags: entryTags,
		};
	}
	if (resolvedDictEntry && dictEntry?.root) {
		const rootEntry = userDictionary[dictEntry.root];
		const rootTags =
			rootEntry?.tags.map((id) => userTags[id]).filter(notUndefined) ||
			[];

		if (rootEntry && rootTags) {
			const resolvedRootEntry = {
				...rootEntry,
				root: undefined,
				tags: rootTags,
			};
			resolvedDictEntry.root = resolvedRootEntry;
		}
	}
	return (
		resolvedDictEntry && (
			<WordFragment
				id={resolvedDictEntry.id}
				dictEntry={resolvedDictEntry}
				renderProps={{ children, attributes, element }}
			/>
		)
	);
};

export default WordFragmentController;
