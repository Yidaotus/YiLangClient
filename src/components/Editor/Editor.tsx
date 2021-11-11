import './Editor.css';
import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';

import { Tabs, Spin, Button } from 'antd';

import handleError from '@helpers/Error';

import { withHistory } from 'slate-history';
import { ReactEditor, Slate, withReact } from 'slate-react';
import {
	createEditor,
	Descendant,
	Editor,
	Element as SlateElement,
	Node as SlateNode,
	Point,
	Range,
	Transforms,
} from 'slate';
import useSelection from '@hooks/useSelection';
import { useActiveLanguageConf } from '@hooks/ConfigQueryHooks';
import { useParams } from 'react-router-dom';
import SentenceEditorModal from '@editor/Toolbar/Modals/SentenceEditor/SentenceEditorModal';
import EditorDocument from './EditorDocument';
import WordsPanel from './WordsPanel/WordsPanel';
import DictPopupController from './Popups/DictPopupController';
import Toolbar from './Toolbar/Toolbar';
import {
	EditorElement,
	CustomEditor,
	withLayout,
	DialogElement,
	DialogLine,
} from './CustomEditor';
import {
	create as createDocumentService,
	update as updateDocumentService,
	remove as removeDocumentService,
	getDocument as getDocumentService,
} from '../../api/document.service';
import WordEditorModal from './Toolbar/Modals/WordEditor/WordEditorModal';

const { TabPane } = Tabs;

const withDialog = (editor: Editor) => {
	const { deleteBackward, insertBreak, normalizeNode } = editor;

	// eslint-disable-next-line no-param-reassign
	editor.normalizeNode = (entry) => {
		const [node, path] = entry;
		// merge dialog nodes
		if (SlateElement.isElement(node) && node.type === 'dialog') {
			const nextNode = Editor.next(editor, { at: path });
			if (nextNode) {
				const [nextNodeElement, nextNodePath] = nextNode;
				if (
					SlateElement.isElement(nextNodeElement) &&
					nextNodeElement.type === 'dialog'
				) {
					// merge
					Transforms.mergeNodes(editor, { at: nextNodePath });
				}
			}
		}
		// Fall back to the original `normalizeNode` to enforce other constraints.
		normalizeNode(entry);
	};

	// eslint-disable-next-line no-param-reassign
	editor.deleteBackward = (unit) => {
		const { selection } = editor;

		if (selection && Range.isCollapsed(selection)) {
			const [dialogSpeechElement] = Editor.nodes(editor, {
				match: (n) =>
					!Editor.isEditor(n) &&
					SlateElement.isElement(n) &&
					n.type === 'dialogLineSpeech',
			});
			if (dialogSpeechElement) {
				const [, cellPath] = dialogSpeechElement;
				const start = Editor.start(editor, cellPath);

				if (Point.equals(selection.anchor, start)) {
					Transforms.move(editor, { reverse: true });
					return;
				}
			}

			const [dialogActorElement] = Editor.nodes(editor, {
				match: (n) =>
					!Editor.isEditor(n) &&
					SlateElement.isElement(n) &&
					n.type === 'dialogLineActor',
			});

			if (dialogActorElement) {
				const [, cellPath] = dialogActorElement;
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
			const [dialogSpeechElement] = Editor.nodes(editor, {
				mode: 'highest',
				match: (n) =>
					!Editor.isEditor(n) &&
					SlateElement.isElement(n) &&
					n.type === 'dialogLineSpeech',
			});
			const [dialogActorElement] = Editor.nodes(editor, {
				mode: 'highest',
				match: (n) =>
					!Editor.isEditor(n) &&
					SlateElement.isElement(n) &&
					n.type === 'dialogLineActor',
			});

			if (dialogSpeechElement) {
				const [, speechPath] = dialogSpeechElement;
				const dialogLineNode: DialogLine = {
					type: 'dialogLine',
					children: [
						{
							type: 'dialogLineActor',
							children: [{ text: '' }],
						},
						{
							type: 'dialogLineSpeech',
							children: [{ text: '' }],
						},
					],
				};
				const [, parentPath] = Editor.parent(editor, speechPath);
				parentPath.splice(
					parentPath.length - 1,
					1,
					parentPath[parentPath.length - 1] + 1
				);
				Transforms.insertNodes(editor, dialogLineNode, {
					at: parentPath,
				});
				Transforms.select(editor, Editor.start(editor, parentPath));
				return;
			}

			if (dialogActorElement && Range.isCollapsed(selection)) {
				const [, actorPath] = dialogActorElement;
				const end = Editor.end(editor, actorPath);
				if (Point.equals(selection.anchor, end)) {
					Transforms.move(editor);
					return;
				}
			}
		}

		insertBreak();
	};

	return editor;
};

const withYiLang = (editor: Editor) => {
	const { isInline, isVoid, normalizeNode } = editor;
	const inlineTypes: Array<EditorElement['type']> = [
		'word',
		'mark',
		'sentence',
		'highlight',
	];

	const voidTypes: Array<EditorElement['type']> = [
		'word',
		'image',
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

	/* 
	editor.normalizeNode = async (entry) => {
		// If the element is a paragraph, ensure its children are valid.

		if (entry) {
			const [node, path] = entry;
			if (SlateElement.isElement(node) && node.type === 'word') {
				const id = node.dictId;
				const dictEntry = await queryClient.fetchQuery(
					['dictEntries', 'details', activeLanguage, id],
					() => {
						return id ? getEntry({ id }) : null;
					}
				);
				if (!dictEntry) {
					Transforms.unwrapNodes(editor, { at: path });
				}
			}
		}
		// Fall back to the original `normalizeNode` to enforce other constraints.
		normalizeNode(entry);
	}; */

	return editor;
};

const AVERAGE_ACTIONS_PER_COMMAND = 4;
const SAVE_EVERY_ACTIONS = 5 * AVERAGE_ACTIONS_PER_COMMAND;
const UPDATE_DEBOUNCE_TIME = 5000;

const YiEditor: React.FC = () => {
	const editorContainer = useRef(null);
	const [loading, setLoading] = useState<string | null>(null);
	const [actionCount, setActionCount] = useState(0);
	const [wordEditorVisible, setWordEditorVisible] = useState(false);
	const [sentenceEditorVisible, setSentenceEditorVisible] = useState(false);
	const activeLanguage = useActiveLanguageConf();
	const { id } = useParams<{ id: string }>();

	const editor = useMemo(
		() =>
			withReact(
				withYiLang(withDialog(withHistory(createEditor())))
			) as CustomEditor,
		[]
	);
	const [selection, setSelection] = useSelection(editor);

	const [editorNodes, setEditorNodes] = useState<Array<Descendant>>([]);

	useEffect(() => {
		const fetch = async () => {
			try {
				setLoading('Fetching Document');
				const doc = await getDocumentService(id);
				setLoading('Decoding Document');
				const deserializedDocument = JSON.parse(
					doc.serializedDocument
				) as Descendant[];
				setEditorNodes(deserializedDocument);
			} catch (error) {
				handleError(error);
			} finally {
				setLoading(null);
			}
		};
		fetch();
	}, [id, setEditorNodes]);

	const deleteDocument = useCallback(async () => {
		try {
			setLoading('Deleting Document');
			await removeDocumentService(id);
		} catch (error) {
			handleError(error);
		} finally {
			setLoading(null);
		}
	}, [id]);

	// TODO throttle!
	const updateDocument = useCallback(async () => {
		if (activeLanguage) {
			try {
				setLoading('Saving Document');
				const title = Editor.string(editor, [0]);
				const serializedDocument = JSON.stringify(editorNodes);
				await updateDocumentService(id, {
					title,
					serializedDocument,
				});
				setLoading('Saving Document');
			} catch (error) {
				handleError(error);
			} finally {
				setLoading(null);
			}
		}
	}, [activeLanguage, editor, editorNodes, id]);

	const createDocument = useCallback(async () => {
		if (activeLanguage) {
			const serializedDocument = JSON.stringify(editorNodes);
			const newDocId = await createDocumentService({
				lang: activeLanguage.id,
				serializedDocument,
			});
		}
	}, [activeLanguage, editorNodes]);

	useEffect(() => {
		if (selection) {
			const range = ReactEditor.toDOMRange(editor, selection);
			const domSelection = document.getSelection();
			if (domSelection?.isCollapsed && !range.collapsed) {
				document.getSelection()?.removeAllRanges();
				document.getSelection()?.addRange(range);
			}
		}
	}, [editor, selection]);

	const closeSentenceEditorModal = useCallback(() => {
		setSentenceEditorVisible(false);
	}, [setSentenceEditorVisible]);

	useEffect(() => {
		if (actionCount >= SAVE_EVERY_ACTIONS) {
			// updateDocument();
			setActionCount(0);
		}
	}, [actionCount, updateDocument]);

	const onEditorChange = useCallback(
		(newValue) => {
			const isAstChange = editor.operations.some(
				(op) => op.type !== 'set_selection'
			);
			const isSelectionChanged = editor.operations.some(
				(op) => op.type === 'set_selection'
			);
			if (isSelectionChanged) {
				setSelection(editor.selection);
			}
			if (isAstChange) {
				// TODO all examples always set newValue? Bug?
				setEditorNodes(newValue);
				setActionCount(
					(count) =>
						count +
						editor.operations.filter(
							(op) => op.type !== 'set_selection'
						).length
				);
			}
		},
		[editor.operations, editor.selection, setSelection]
	);

	const closeWordEditorModal = useCallback(() => {
		setWordEditorVisible(false);
	}, [setWordEditorVisible]);

	return (
		<div
			onMouseUp={(e) => {
				e.preventDefault();
			}}
			role="none"
		>
			<div>
				<Spin
					spinning={!!loading}
					size="large"
					tip={loading || undefined}
				>
					<div>
						<div className="editor-container">
							<Slate
								editor={editor}
								value={editorNodes}
								onChange={onEditorChange}
							>
								<Tabs
									defaultActiveKey="1"
									centered
									tabBarStyle={{
										position: 'sticky',
									}}
								>
									<TabPane tab="Document" key="1">
										<div
											ref={editorContainer}
											style={{ position: 'relative' }}
										>
											<Toolbar
												selection={selection}
												showSentenceEditor={() => {
													setSentenceEditorVisible(
														true
													);
												}}
												showWordEditor={() => {
													setWordEditorVisible(true);
												}}
											/>
											<WordEditorModal
												visible={wordEditorVisible}
												close={closeWordEditorModal}
											/>
											<SentenceEditorModal
												visible={sentenceEditorVisible}
												close={closeSentenceEditorModal}
											/>
											<DictPopupController
												rootElement={editorContainer}
												selection={selection}
											/>
											<EditorDocument />
										</div>
									</TabPane>
									<TabPane tab="Elements" key="2">
										<WordsPanel />
									</TabPane>
									<TabPane tab="Debug" key="3">
										<Button onClick={createDocument}>
											Create
										</Button>
										<Button onClick={updateDocument}>
											Update
										</Button>
										<Button onClick={deleteDocument}>
											Delete
										</Button>
										<pre>
											{JSON.stringify(
												editor.children,
												null,
												2
											)}
										</pre>
									</TabPane>
								</Tabs>
							</Slate>
						</div>
					</div>
				</Spin>
			</div>
		</div>
	);
};

export default YiEditor;
