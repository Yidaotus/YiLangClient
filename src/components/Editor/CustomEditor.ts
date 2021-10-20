// This example is for an Editor with `ReactEditor` and `HistoryEditor`
import { UUID } from 'Document/UUID';
import {
	BaseEditor,
	Descendant,
	Editor,
	Element as SlateElement,
	Selection,
	Range,
	Location,
	Node as SlateNode,
	Transforms,
} from 'slate';
import { ReactEditor } from 'slate-react';

export type CustomEditor = BaseEditor & ReactEditor;

export const BlockTypes = ['title', 'subtitle', 'paragraph', 'image'] as const;
export const InlineTypes = ['word', 'sentence', 'mark', 'highlight'] as const;
export const ElementTypeLabels: {
	[k in typeof BlockTypes[number] | typeof InlineTypes[number]]: string;
} = {
	title: 'Title',
	subtitle: 'Subtitle',
	paragraph: 'Paragraph',
	image: 'Image',
	word: 'Word',
	sentence: 'Sentence',
	mark: 'Mark',
	highlight: 'Highlight',
};

export type HighlightElement = {
	type: 'highlight';
	role: 'highlight' | 'deemphasize';
	children: CustomText[];
};

export type SentenceElement = {
	type: 'sentence';
	translation: string;
	children: CustomText[];
};

export type WordElement = {
	type: 'word';
	dictId: UUID;
	children: CustomText[];
};

export type SubtitleElement = {
	type: 'subtitle';
	children: CustomText[];
};

export type TitleElement = {
	type: 'title';
	children: CustomText[];
};

export type ParagraphElement = {
	type: 'paragraph';
	children: Descendant[];
};

export type ImageElement = {
	type: 'image';
	src: string;
	caption?: string;
	children: CustomText[];
};

export type MarkElement = {
	type: 'mark';
	color: string;
	children: CustomText[];
};

export type EditorBlockElement =
	| ParagraphElement
	| ImageElement
	| TitleElement
	| SubtitleElement;

export type EditorInlineElement =
	| WordElement
	| MarkElement
	| HighlightElement
	| SentenceElement;

export type EditorElement = EditorBlockElement | EditorInlineElement;
export type FormattedText = { text: string; bold?: true };
export type CustomText = FormattedText;

declare module 'slate' {
	interface CustomTypes {
		Editor: CustomEditor;
		Element: EditorElement;
		Text: CustomText;
	}
}

export const isNodeAtSelection = (
	editor: Editor,
	selection: Selection,
	type: EditorElement['type']
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
	type: EditorElement['type']
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

export const highlightSelection = (
	editor: Editor,
	selection?: Location
): (() => void) | null => {
	const sel = selection || editor.selection;
	if (!sel) {
		return null;
	}

	const topLevelElement = Editor.above(editor, {
		at: sel,
		match: (e) => SlateElement.isElement(e),
		mode: 'highest',
	});

	if (!topLevelElement) {
		return null;
	}

	const [topLevelNode, topLevelPath] = topLevelElement;

	const highlightElem: HighlightElement = {
		type: 'highlight',
		role: 'highlight',
		children: [{ text: '' }],
	};

	const deepmhesizeElement: HighlightElement = {
		type: 'highlight',
		role: 'deemphasize',
		children: [{ text: '' }],
	};

	Transforms.wrapNodes(editor, deepmhesizeElement, {
		at: {
			anchor: {
				path: topLevelPath,
				offset: 0,
			},
			focus: {
				path: topLevelPath,
				offset: 1,
			},
		},
		split: false,
	});

	if (editor.selection) {
		Transforms.wrapNodes(editor, highlightElem, {
			at: editor.selection,
			split: true,
		});
	}

	const removeHighlights = () => {
		Transforms.unwrapNodes(editor, {
			at: {
				anchor: {
					path: topLevelPath,
					offset: 0,
				},
				focus: {
					path: topLevelPath,
					offset: SlateNode.string(topLevelNode).length,
				},
			},
			match: (e) => SlateElement.isElement(e) && e.type === 'highlight',
		});

		Transforms.unwrapNodes(editor, {
			at: {
				anchor: {
					path: topLevelPath,
					offset: 0,
				},
				focus: {
					path: topLevelPath,
					offset: SlateNode.string(topLevelNode).length,
				},
			},
			match: (e) => SlateElement.isElement(e) && e.type === 'highlight',
		});
	};

	return removeHighlights;
};

export const getTextBlockStyle = (
	editor: Editor
): EditorElement['type'] | null | 'multiple' => {
	const { selection } = editor;
	if (selection == null) {
		return null;
	}
	const [start, end] = Range.edges(selection);

	let startTopLevelBlockIndex = start.path[0];
	const endTopLevelBlockIndex = end.path[0];

	let blockType = null;
	while (startTopLevelBlockIndex <= endTopLevelBlockIndex) {
		const [node] = Editor.node(editor, [startTopLevelBlockIndex]);
		if (SlateElement.isElement(node)) {
			if (blockType === null) {
				blockType = node.type;
			} else if (blockType !== node.type) {
				return 'multiple';
			}
		}
		startTopLevelBlockIndex++;
	}

	return blockType;
};

export const toggleBlockType = (
	editor: Editor,
	blockType: EditorElement['type']
): void => {
	if (editor.selection) {
		const currentBlockType = getTextBlockStyle(editor);
		const changeTo =
			currentBlockType === blockType ? 'paragraph' : blockType;
		Transforms.setNodes(
			editor,
			{ type: changeTo },
			{ at: editor.selection, match: (n) => Editor.isBlock(editor, n) }
		);
	}
};
