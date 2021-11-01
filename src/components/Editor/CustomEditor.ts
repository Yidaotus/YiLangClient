// This example is for an Editor with `ReactEditor` and `HistoryEditor`
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
import { HistoryEditor } from 'slate-history';

export type CustomEditor = BaseEditor & ReactEditor & HistoryEditor;

export const BlockTypes = [
	'title',
	'subtitle',
	'paragraph',
	'image',
	'listItem',
	'bulletedList',
	'numberedList',
	'blockQuote',
] as const;
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
	listItem: 'List',
	numberedList: 'Numbered List',
	bulletedList: 'Bulleted List',
	blockQuote: 'Quote',
};

export type AlignValue = 'left' | 'right' | 'center' | null;

export type HighlightElement = {
	type: 'highlight';
	role: 'highlight' | 'deemphasize';
	children: CustomText[];
};

export type ListItemElement = {
	type: 'listItem';
	children: CustomText[];
};

export type BlockQuoteElement = {
	type: 'blockQuote';
	align: AlignValue;
	children: CustomText[];
};

export type NumberedListElement = {
	type: 'numberedList';
	children: ListItemElement[];
};

export type BulletedListElement = {
	type: 'bulletedList';
	children: ListItemElement[];
};

export type SentenceElement = {
	type: 'sentence';
	translation: string;
	children: CustomText[];
};

export type WordElement = {
	type: 'word';
	dictId: string;
	isUserInput: boolean;
	children: CustomText[];
};

export type SubtitleElement = {
	type: 'subtitle';
	align: AlignValue;
	children: CustomText[];
};

export type TitleElement = {
	type: 'title';
	align: AlignValue;
	children: CustomText[];
};

export type WordListElement = {
	type: 'wordList';
	children: CustomText[];
};

export type ParagraphElement = {
	type: 'paragraph';
	align: AlignValue;
	children: Descendant[];
};

export type ImageElement = {
	type: 'image';
	src: string;
	align: AlignValue;
	caption?: string;
	children: CustomText[];
};

export type MarkElement = {
	type: 'mark';
	color: string;
	children: CustomText[];
};

export type AlignableElement =
	| ParagraphElement
	| TitleElement
	| BlockQuoteElement
	| SubtitleElement;

export type EditorBlockElement =
	| ParagraphElement
	| ImageElement
	| TitleElement
	| BlockQuoteElement
	| BulletedListElement
	| NumberedListElement
	| ListItemElement
	| WordListElement
	| SubtitleElement;

export type EditorInlineElement =
	| WordElement
	| MarkElement
	| HighlightElement
	| SentenceElement;

export type EditorElement = EditorBlockElement | EditorInlineElement;
export type FormattedText = { text: string; bold?: true; color?: string };
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

export const getRootBlocks = (editor: Editor) => {
	const { selection } = editor;
	if (selection == null) {
		return [];
	}
	const [start, end] = Range.edges(selection);

	let startTopLevelBlockIndex = start.path[0];
	const endTopLevelBlockIndex = end.path[0];

	const rootBlocks: Array<EditorElement> = [];
	while (startTopLevelBlockIndex <= endTopLevelBlockIndex) {
		const [node] = Editor.node(editor, [startTopLevelBlockIndex]);
		if (SlateElement.isElement(node)) {
			rootBlocks.push(node);
		}
		startTopLevelBlockIndex++;
	}

	return rootBlocks;
};

export const getTextBlockStyle = (
	editor: Editor
): EditorElement['type'] | null | 'multiple' => {
	let blockType = null;
	const rootBlocks = getRootBlocks(editor);
	for (const block of rootBlocks) {
		if (blockType === null) {
			blockType = block.type;
		} else if (blockType !== block.type) {
			return 'multiple';
		}
	}
	return blockType;
};

export const getAlign = (editor: Editor): AlignValue | null => {
	let blockAlign = null;
	const rootBlocks = getRootBlocks(editor).filter(
		(block): block is AlignableElement =>
			(block as AlignableElement).align !== undefined
	);
	for (const block of rootBlocks) {
		if (blockAlign === null) {
			blockAlign = block.align;
		} else if (blockAlign !== block.align) {
			return null;
		}
	}
	return blockAlign;
};

export const toggleBlockType = (
	editor: Editor,
	blockType: EditorElement['type'],
	applyToRoot?: boolean
): void => {
	const currentBlockType = getTextBlockStyle(editor);
	const changeTo = currentBlockType === blockType ? 'paragraph' : blockType;
	Transforms.setNodes(
		editor,
		{ type: changeTo },
		{
			match: (n) => Editor.isBlock(editor, n),
			mode: applyToRoot ? 'highest' : 'lowest',
		}
	);
};

export const withLayout = (editor: Editor) => {
	const { normalizeNode } = editor;

	// eslint-disable-next-line no-param-reassign
	editor.normalizeNode = ([node, path]) => {
		if (path.length === 0) {
			if (editor.children.length < 1) {
				const title: TitleElement = {
					type: 'title',
					align: null,
					children: [{ text: 'Untitled' }],
				};
				Transforms.insertNodes(editor, title, { at: path.concat(0) });
			}

			if (editor.children.length < 2) {
				const paragraph: ParagraphElement = {
					type: 'paragraph',
					align: null,
					children: [{ text: '' }],
				};
				Transforms.insertNodes(editor, paragraph, {
					at: path.concat(1),
				});
			}

			for (const [child, childPath] of SlateNode.children(editor, path)) {
				const slateIndex = childPath[0];
				const enforceType = (elementType: EditorElement['type']) => {
					if (
						SlateElement.isElement(child) &&
						child.type !== elementType
					) {
						const newProperties: Partial<SlateElement> = {
							type: elementType,
						};
						Transforms.setNodes(editor, newProperties, {
							at: childPath,
						});
					}
				};

				switch (slateIndex) {
					case 0:
						enforceType('title');
						break;
					case 1:
						enforceType('paragraph');
						break;
					default:
						break;
				}
			}
		}

		return normalizeNode([node, path]);
	};

	return editor;
};
