// This example is for an Editor with `ReactEditor` and `HistoryEditor`
import { BaseEditor, Editor, Element as SlateElement, Selection } from 'slate';
import { ReactEditor } from 'slate-react';

export type CustomEditor = BaseEditor & ReactEditor;

export type SentenceElement = {
	type: 'sentence';
	translation: string;
	children: CustomText[];
};

export type VocabElement = {
	type: 'vocab';
	wordId: string;
	children: CustomText[];
};

export type ParagraphElement = {
	type: 'paragraph';
	children: CustomText[];
};

export type HeadingElement = {
	type: 'heading';
	level: number;
	children: CustomText[];
};

export type MarkElement = {
	type: 'mark';
	color: string;
	children: CustomText[];
};

export type CustomElement =
	| ParagraphElement
	| HeadingElement
	| VocabElement
	| MarkElement
	| SentenceElement;

export type FormattedText = { text: string; bold?: true };

export type CustomText = FormattedText;

declare module 'slate' {
	interface CustomTypes {
		Editor: CustomEditor;
		Element: CustomElement;
		Text: CustomText;
	}
}

export const isNodeAtSelection = (
	editor: Editor,
	selection: Selection,
	type: CustomElement['type']
): boolean => {
	if (selection == null) {
		return false;
	}

	const isAbove =
		Editor.above(editor, {
			at: selection,
			match: (n) => SlateElement.isElement(n) && n.type === type,
		}) != null;
	return isAbove;
};

export const isNodeInSelection = (
	editor: Editor,
	selection: Selection,
	type: CustomElement['type']
): boolean => {
	if (selection == null) {
		return false;
	}

	const nodesInside = Editor.nodes(editor, {
		at: selection,
		match: (n) => SlateElement.isElement(n) && n.type === type,
	});
	return !nodesInside.next().done;
};
