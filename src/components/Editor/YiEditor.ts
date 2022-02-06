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
	Point,
	NodeEntry,
} from 'slate';
import { ReactEditor } from 'slate-react';
import { HistoryEditor, withHistory } from 'slate-history';
import { DictionaryEntryID } from 'Document/Utility';
import { withCorrectVoidBehavior } from './Plugins/withCorrectVoidBehavior';

export type CustomEditor = BaseEditor & ReactEditor & HistoryEditor;

const BlockTypes = [
	'documentTitle',
	'title',
	'paragraph',
	'image',
	'listItem',
	'bulletedList',
	'numberedList',
	'blockQuote',
] as const;

const InlineTypes = ['word', 'sentence', 'mark', 'highlight'] as const;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ElementTypeLabels: {
	[k in typeof BlockTypes[number] | typeof InlineTypes[number]]: string;
} = {
	documentTitle: 'Document Title',
	title: 'Title',
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

export type AlignValue = 'left' | 'right' | 'center' | 'justify' | null;
export type FormattedText = {
	text: string;
	bold?: true;
	color?: string;
	placeholder?: boolean;
};
export type CustomText = FormattedText;

export type HighlightElement = {
	type: 'highlight';
	role: 'highlight' | 'deemphasize';
	children: CustomText[];
};

export type ListItemElement = {
	type: 'listItem';
	children: Array<CustomText | EditorInlineElement>;
};

export interface BlockQuoteElement {
	type: 'blockQuote';
	align: AlignValue;
	children: Array<CustomText | EditorInlineElement>;
}

export type DialogLine = {
	type: 'dialogLine';
	alignment: 'left' | 'right';
	name: string;
	color: string;
	children: Array<CustomText | EditorInlineElement>;
};

export type DialogElement = {
	type: 'dialog';
	children: DialogLine[];
};

export type DocumentTitleElement = {
	type: 'documentTitle';
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
	sentenceId: string;
	children: Array<CustomText | EditorInlineElement>;
};

export type WordElement = {
	type: 'word';
	dictId: DictionaryEntryID;
	isUserInput: boolean;
	children: CustomText[];
};

export type TitleElement = {
	type: 'title';
	align: AlignValue;
	variant: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
	children: Array<CustomText | EditorInlineElement>;
};

export type VideoElement = {
	type: 'video';
	src: string;
	children: CustomText[];
};

export type WordListElement = {
	type: 'wordList';
	children: CustomText[];
};

export type ParagraphElement = {
	type: 'paragraph';
	align: AlignValue;
	children: Array<CustomText | EditorInlineElement>;
};

export type ImageElement = {
	type: 'image';
	src: string;
	align: AlignValue;
	width: number;
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
	| BlockQuoteElement;

export type EditorBlockElement =
	| ParagraphElement
	| ImageElement
	| TitleElement
	| DocumentTitleElement
	| VideoElement
	| BlockQuoteElement
	| BulletedListElement
	| NumberedListElement
	| ListItemElement
	| WordListElement
	| DialogElement
	| DialogLine;

export type EditorInlineElement =
	| WordElement
	| MarkElement
	| HighlightElement
	| SentenceElement;

export type EditorElement = EditorBlockElement | EditorInlineElement;

declare module 'slate' {
	interface CustomTypes {
		Editor: CustomEditor;
		Element: EditorElement;
		Text: CustomText;
	}
}

const isNodeAtSelection = (
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

const isNodeInSelection = (
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

const highlightSelection = (
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

const getRootBlocks = (editor: Editor): Array<EditorElement> => {
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

const getTextBlockStyle = (
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

const getAlign = (editor: Editor): AlignValue | null => {
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

const toggleBlockType = <T extends EditorElement['type']>(
	editor: Editor,
	blockType: T,
	applyToRoot?: boolean,
	blockProps?: Omit<
		Extract<EditorBlockElement, { type: T }>,
		'type' | 'children'
	>
): void => {
	const currentBlockType = getTextBlockStyle(editor);
	const changeTo = currentBlockType === blockType ? 'paragraph' : blockType;
	Transforms.setNodes(
		editor,
		{ type: changeTo, ...blockProps },
		{
			match: (n) => Editor.isBlock(editor, n),
			mode: applyToRoot ? 'highest' : 'lowest',
		}
	);
};

const withList = (editor: Editor): CustomEditor => {
	const { insertBreak, normalizeNode, deleteBackward } = editor;

	// eslint-disable-next-line no-param-reassign
	editor.deleteBackward = (unit) => {
		const { selection } = editor;

		if (selection && Range.isCollapsed(selection)) {
			const [listItemNode] = Editor.nodes(editor, {
				match: (n) =>
					!Editor.isEditor(n) &&
					SlateElement.isElement(n) &&
					n.type === 'listItem',
			});

			if (listItemNode) {
				const [, listItemPath] = listItemNode;
				const start = Editor.start(editor, listItemPath);

				if (Point.equals(selection.anchor, start)) {
					Transforms.removeNodes(editor, { at: listItemPath });
					return;
				}
			}
		}

		deleteBackward(unit);
	};

	// eslint-disable-next-line no-param-reassign
	editor.normalizeNode = (entry) => {
		const listNodes: Array<EditorElement['type']> = [
			'numberedList',
			'bulletedList',
		];
		const [node, path] = entry;

		if (SlateElement.isElement(node) && node.type === 'listItem') {
			for (const [child, childPath] of SlateNode.children(editor, path)) {
				if (
					SlateElement.isElement(child) &&
					!Editor.isInline(editor, child)
				) {
					Transforms.unwrapNodes(editor, { at: childPath });
				}
			}
			return;
		}

		// If the element is a paragraph, ensure its children are valid.
		if (SlateElement.isElement(node) && listNodes.includes(node.type)) {
			if (node.children.length < 1) {
				Transforms.removeNodes(editor, { at: path });
			} else {
				for (const [child, childPath] of SlateNode.children(
					editor,
					path
				)) {
					const childRootPath = [childPath[0], childPath[1]];
					if (
						SlateElement.isElement(child) &&
						child.type !== 'listItem'
					) {
						Transforms.wrapNodes(
							editor,
							{
								type: 'listItem',
								children: [],
							},
							{ at: childRootPath }
						);
					}
					if (!SlateElement.isElement(child)) {
						Transforms.wrapNodes(
							editor,
							{
								type: 'listItem',
								children: [],
							},
							{ at: childRootPath }
						);
					}
				}
			}
			return;
		}

		// Fall back to the original `normalizeNode` to enforce other constraints.
		normalizeNode(entry);
	};

	// eslint-disable-next-line no-param-reassign
	editor.insertBreak = () => {
		const { selection } = editor;

		if (selection) {
			const [listItem] = Editor.nodes(editor, {
				mode: 'highest',
				match: (n) =>
					!Editor.isEditor(n) &&
					SlateElement.isElement(n) &&
					n.type === 'listItem',
			});
			if (listItem) {
				const [listNode, listPath] = listItem;
				if (!SlateNode.string(listNode)) {
					const emptyParagraph: ParagraphElement = {
						type: 'paragraph',
						align: 'left',
						children: [{ text: '' }],
					};
					const listRootPath = listPath[0];
					Transforms.removeNodes(editor);
					Transforms.insertNodes(editor, emptyParagraph, {
						at: [listRootPath + 1],
					});
					Transforms.move(editor);
					return;
				}
			}
		}

		insertBreak();
	};
	return editor;
};

const withDialog = (editor: Editor): CustomEditor => {
	const { deleteBackward, insertBreak, normalizeNode } = editor;

	// eslint-disable-next-line no-param-reassign
	editor.normalizeNode = (entry) => {
		const [node, path] = entry;

		// If the element is a paragraph, ensure its children are valid.
		if (SlateElement.isElement(node) && node.type === 'dialogLine') {
			for (const [childNode, childPath] of SlateNode.children(
				editor,
				path
			)) {
				if (
					SlateElement.isElement(childNode) &&
					!Editor.isInline(editor, childNode)
				) {
					Transforms.unwrapNodes(editor, { at: childPath });
				}
			}

			if (node.children.length < 1) {
				Transforms.insertNodes(
					editor,
					{
						type: 'dialogLine',
						color: '',
						name: '',
						alignment: 'left',
						children: [{ text: '' }],
					},
					{ at: [...path, 0] }
				);
			}
			return;
		}

		if (SlateElement.isElement(node) && node.type === 'dialog') {
			if (node.children.length < 1) {
				Transforms.removeNodes(editor, { at: path });
				return;
			}
		}

		// Fall back to the original `normalizeNode` to enforce other constraints.
		normalizeNode(entry);
	};

	// eslint-disable-next-line no-param-reassign
	editor.deleteBackward = (unit) => {
		const { selection } = editor;

		if (selection && Range.isCollapsed(selection)) {
			const [dialogLineElement] = Editor.nodes(editor, {
				match: (n) =>
					!Editor.isEditor(n) &&
					SlateElement.isElement(n) &&
					n.type === 'dialogLine',
			});

			if (dialogLineElement) {
				const [, cellPath] = dialogLineElement;
				const start = Editor.start(editor, cellPath);

				if (Point.equals(selection.anchor, start)) {
					const [dialogLineParent] = Editor.nodes(editor, {
						mode: 'highest',
						match: (n) =>
							!Editor.isEditor(n) &&
							SlateElement.isElement(n) &&
							n.type === 'dialogLine',
					});

					if (dialogLineParent) {
						const [, path] = dialogLineParent;
						Transforms.removeNodes(editor, { at: path });
						return;
					}
				}
			}
		}

		deleteBackward(unit);
	};

	// eslint-disable-next-line no-param-reassign
	editor.insertBreak = () => {
		const { selection } = editor;

		if (selection) {
			const [dialogLineElement] = Editor.nodes(editor, {
				mode: 'highest',
				match: (n) =>
					!Editor.isEditor(n) &&
					SlateElement.isElement(n) &&
					n.type === 'dialogLine',
			});

			if (dialogLineElement) {
				const [element, path] =
					dialogLineElement as NodeEntry<DialogLine>;
				const [parent, parentPath] = Editor.parent(editor, path);
				const speech = Editor.string(editor, path);
				if (speech.length > 0) {
					const dialogLineNode: DialogLine = {
						type: 'dialogLine',
						alignment:
							element.alignment === 'left' ? 'right' : 'left',
						color: '',
						name: '',
						children: [{ text: '' }],
					};
					const targetPositionInDialog = path[path.length - 1];
					const targetPath = [...path];
					targetPath.splice(-1, 1, targetPositionInDialog + 1);
					Transforms.insertNodes(editor, dialogLineNode, {
						at: targetPath,
					});
					Transforms.select(editor, Editor.start(editor, targetPath));
				} else {
					const emptyParagraph: ParagraphElement = {
						type: 'paragraph',
						align: 'left',
						children: [{ text: '' }],
					};
					const dialogRootPath = path[0];
					const dialogLinePath = path[1];
					Transforms.removeNodes(editor, {
						at: [dialogRootPath, dialogLinePath],
					});
					Transforms.insertNodes(editor, emptyParagraph, {
						at: [dialogRootPath + 1],
					});
					Transforms.move(editor);
				}
				return;
			}
		}

		insertBreak();
	};

	return editor;
};

const withLayout = (editor: Editor): CustomEditor => {
	const { normalizeNode } = editor;

	// eslint-disable-next-line no-param-reassign
	editor.normalizeNode = ([node, path]) => {
		if (path.length === 0) {
			if (editor.children.length < 1) {
				const title: DocumentTitleElement = {
					type: 'documentTitle',
					children: [{ text: 'Untitled' }],
				};
				Transforms.insertNodes(editor, title, { at: path.concat(0) });
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
						enforceType('documentTitle');
						break;
					case 1: {
						if (
							SlateElement.isElement(child) &&
							child.type === 'documentTitle'
						) {
							enforceType('paragraph');
						}
						break;
					}
					default:
						break;
				}
			}
		}

		return normalizeNode([node, path]);
	};

	return editor;
};

const withYiLang = (editor: Editor): CustomEditor => {
	const { isInline, isVoid } = editor;
	const inlineTypes: Array<EditorElement['type']> = [
		'word',
		'mark',
		'sentence',
		'highlight',
	];

	const voidTypes: Array<EditorElement['type']> = [
		'word',
		'image',
		'video',
		'wordList',
	];

	// eslint-disable-next-line no-param-reassign
	editor.isInline = (element) => {
		return inlineTypes.includes(element.type) ? true : isInline(element);
	};

	// eslint-disable-next-line no-param-reassign
	editor.isVoid = (element) => {
		return voidTypes.includes(element.type) ? true : isVoid(element);
	};

	return withHistory(
		withLayout(withList(withDialog(withCorrectVoidBehavior(editor))))
	);
};

const YiEditor = {
	...Editor,
	isNodeAtSelection,
	isNodeInSelection,
	highlightSelection,
	toggleBlockType,
	getAlign,
	getTextBlockStyle,
};

export { YiEditor, withYiLang };
