import './Editor.css';
import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';

import handleError from '@helpers/Error';

import { withHistory } from 'slate-history';
import { Slate, withReact } from 'slate-react';
import { BaseRange, createEditor, Descendant, Editor, Transforms } from 'slate';
import useSelection from '@hooks/useSelection';
import { useActiveLanguageConf } from '@hooks/ConfigQueryHooks';
import { Prompt, useParams } from 'react-router-dom';
import SentenceEditorModal from '@editor/Toolbar/Modals/SentenceEditor/SentenceEditorModal';
import {
	useEditorDocument,
	useUpdateEditorDocument,
} from '@hooks/DocumentQueryHooks';
import { Button, Icon, Intent, Spinner, Tab, Tabs } from '@blueprintjs/core';
import EditorDocument from './EditorDocument';
import WordsPanel from './WordsPanel/WordsPanel';
import DictPopupController from './Popups/DictPopupController';
import Toolbar from './Toolbar/Toolbar';
import {
	EditorElement,
	CustomEditor,
	withDialog,
	withList,
} from './CustomEditor';
import WordEditorModal from './Toolbar/Modals/WordEditor/WordEditorModal';

const withYiLang = (editor: Editor) => {
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

	return editor;
};

const AVERAGE_ACTIONS_PER_COMMAND = 15;
const SAVE_EVERY_ACTIONS = 5 * AVERAGE_ACTIONS_PER_COMMAND;

export type SavingState = 'LOADING' | 'SUCCESS' | 'ERROR' | 'IDLE';

const YiEditor: React.FC = () => {
	const editorContainer = useRef(null);
	const [savingIndicator, setSavingIndicator] = useState<SavingState>('IDLE');
	const [actionCount, setActionCount] = useState(0);
	const [wordEditorVisible, setWordEditorVisible] = useState(false);
	const [sentenceEditorVisible, setSentenceEditorVisible] = useState(false);
	const [isEditorDirty, setIsEditorDirty] = useState(false);
	const [savedSelection, setSavedSelection] = useState<BaseRange | null>(
		null
	);
	const activeLanguage = useActiveLanguageConf();
	const { id } = useParams<{ id: string }>();
	const updateEditorDocument = useUpdateEditorDocument();
	const [loadingDocument, dbDocument] = useEditorDocument(id);

	const editor = useMemo(
		() =>
			withReact(
				withYiLang(withList(withDialog(withHistory(createEditor()))))
			) as CustomEditor,
		[]
	);
	const [selection, setSelection] = useSelection(editor);
	const [editorNodes, setEditorNodes] = useState<Array<Descendant>>([]);

	useEffect(() => {
		const fetch = async () => {
			try {
				if (dbDocument) {
					const deserializedDocument = JSON.parse(
						dbDocument.serializedDocument
					) as Descendant[];
					setEditorNodes(deserializedDocument);
				}
			} catch (error) {
				handleError(error);
			}
		};
		fetch();
	}, [dbDocument, setEditorNodes]);

	const deleteDocument = useCallback(async () => {
		try {
			// await removeDocumentService(id);
		} catch (error) {
			handleError(error);
		}
	}, []);

	// TODO throttle!
	const updateDocument = useCallback(async () => {
		if (activeLanguage) {
			try {
				setSavingIndicator('LOADING');
				const title = Editor.string(editor, [0], { voids: true });
				const serializedDocument = JSON.stringify(editorNodes);
				await updateEditorDocument.mutateAsync({
					id,
					title,
					serializedDocument,
				});

				// Hacky but feels beter for the user to actually see the saving process
				setTimeout(() => {
					setSavingIndicator('SUCCESS');
					setTimeout(() => {
						setSavingIndicator('IDLE');
					}, 2000);
				}, 1000);
			} catch (error) {
				setSavingIndicator('ERROR');
				handleError(error);
			} finally {
				setIsEditorDirty(false);
			}
		}
	}, [activeLanguage, editor, editorNodes, id, updateEditorDocument]);

	const closeSentenceEditorModal = useCallback(() => {
		setSentenceEditorVisible(false);
	}, [setSentenceEditorVisible]);

	useEffect(() => {
		if (actionCount >= SAVE_EVERY_ACTIONS) {
			updateDocument();
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
				setIsEditorDirty(true);
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

	const closeWordEditorModal = useCallback(
		(restoreSelection = false) => {
			setWordEditorVisible(false);
			if (savedSelection && restoreSelection) {
				Transforms.select(editor, savedSelection);
			}
		},
		[editor, savedSelection]
	);

	return (
		<div
			onMouseUp={(e) => {
				e.preventDefault();
			}}
			role="none"
		>
			<Prompt
				message="There are unsaved changes, which will be lost. Please safe before!"
				when={isEditorDirty}
			/>
			{savingIndicator !== 'IDLE' && (
				<div className="saving-indicator-container">
					{savingIndicator === 'LOADING' && (
						<>
							<Spinner intent={Intent.PRIMARY} size={20} />
							<span>Saving document...</span>
						</>
					)}
					{savingIndicator === 'ERROR' && (
						<>
							<Icon intent={Intent.WARNING} icon="error" />
							<span> Something went wrong!</span>
						</>
					)}
					{savingIndicator === 'SUCCESS' && (
						<>
							<Icon intent={Intent.SUCCESS} icon="tick" />
							<span> Document saved</span>
						</>
					)}
				</div>
			)}
			<div>
				{!!loadingDocument && <Spinner />}
				<div>
					<div className="editor-container">
						<Slate
							editor={editor}
							value={editorNodes}
							onChange={onEditorChange}
						>
							<Tabs>
								<Tab
									title="Document"
									key="1"
									id="1"
									panel={
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
													setSavedSelection(
														editor.selection
													);
													setWordEditorVisible(true);
												}}
												updateDocument={updateDocument}
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
									}
								/>
								<Tab
									title="Elements"
									key="2"
									id="2"
									panel={<WordsPanel />}
								/>
								<Tab
									title="Debug"
									key="3"
									id="3"
									panel={
										<div>
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
										</div>
									}
								/>
							</Tabs>
						</Slate>
					</div>
				</div>
			</div>
		</div>
	);
};

export default YiEditor;
