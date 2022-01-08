import './Editor.css';
import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import { Slate, withReact } from 'slate-react';
import { BaseRange, createEditor, Descendant, Editor, Transforms } from 'slate';
import useSelection from '@hooks/useSelection';
import { useNavigate, useParams } from 'react-router-dom';
import SentenceEditorModal from '@editor/Toolbar/Modals/SentenceEditor/SentenceEditorModal';
import {
	useEditorDocument,
	useUpdateEditorDocument,
} from '@hooks/DocumentQueryHooks';
import { CircularProgress, Typography } from '@mui/material';
import EditorDocument from './EditorDocument';
import DictPopupController from './Popups/DictPopupController';
import Toolbar from './Toolbar/Toolbar';
import { withYiLang } from './YiEditor';
import WordEditorModal from './Toolbar/Modals/WordEditor/WordEditorModal';
import SavingIndicator, {
	SavingState,
} from './SavingIndicator/SavingIndicator';
import { useActiveLanguageConf } from '@hooks/ConfigQueryHooks';
import useUiErrorHandler from '@helpers/Error';
import DraggableDictionary from './DraggableDictionary';
import useDebounce from '@hooks/useDebounce';

const AVERAGE_ACTIONS_PER_COMMAND = 15;
const SAVE_EVERY_ACTIONS = 5 * AVERAGE_ACTIONS_PER_COMMAND;

const YiEditor: React.FC = () => {
	const editorContainer = useRef(null);
	const [savingIndicator, setSavingIndicator] = useState<SavingState>('IDLE');
	const [actionCount, setActionCount] = useState(0);
	const actionCountDebounced = useDebounce(actionCount, 500);
	const [wordEditorVisible, setWordEditorVisible] = useState(false);
	const [sentenceEditorVisible, setSentenceEditorVisible] = useState(false);
	const [isEditorDirty, setIsEditorDirty] = useState(false);
	const [savedSelection, setSavedSelection] = useState<BaseRange | null>(
		null
	);
	const { id } = useParams<{ id: string }>();
	// the returned object does change, only the functions themselves are referentially stable
	// destruct so it can serve as a dependency. See: https://github.com/facebook/react/issues/15924#issuecomment-521253636
	const { mutateAsync: updateDocumentAsync } = useUpdateEditorDocument();
	const [loadingDocument, dbDocument] = useEditorDocument(id);

	const [showSpelling, setShowSpelling] = useState(false);
	const [editor] = useState(withReact(withYiLang(createEditor())));
	const [selection, setSelection] = useSelection(editor);
	const [editorNodes, setEditorNodes] = useState<Array<Descendant>>([]);
	const navigate = useNavigate();
	const activeLanguage = useActiveLanguageConf();
	const handleError = useUiErrorHandler();

	useEffect(() => {
		if (dbDocument && dbDocument?.lang !== activeLanguage?.id) {
			navigate('/home');
		}
	}, [activeLanguage?.id, dbDocument, navigate]);

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
	}, [dbDocument, handleError, setEditorNodes]);

	const updateDocument = useCallback(async () => {
		try {
			setSavingIndicator('LOADING');

			const title = Editor.string(editor, [0], { voids: true });
			const serializedDocument = JSON.stringify(editor.children);
			await updateDocumentAsync({
				id: id || 'what',
				title,
				serializedDocument,
			});

			// Hacky but feels better for the user to actually see the saving process
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
	}, [editor, handleError, id, updateDocumentAsync]);

	const closeSentenceEditorModal = useCallback(() => {
		setSentenceEditorVisible(false);
	}, [setSentenceEditorVisible]);

	/*
	useEffect(() => {
		if (
			actionCountDebounced >= SAVE_EVERY_ACTIONS &&
			savingIndicator === 'IDLE'
		) {
			updateDocument();
			setActionCount(0);
		}
	}, [actionCountDebounced, savingIndicator, updateDocument]);
	*/

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
				setIsEditorDirty(true);
				setActionCount(
					(count) =>
						count +
						editor.operations.filter(
							(op) => op.type !== 'set_selection'
						).length
				);
				setEditorNodes(newValue);
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

	const toolbarShowSentenceEditorHandle = useCallback(() => {
		setSentenceEditorVisible(true);
	}, []);
	const toolbarShowWordEditorHandle = useCallback(() => {
		setWordEditorVisible(true);
	}, []);
	const toolbarShowSpellingHandle = useCallback((show: boolean) => {
		setShowSpelling(show);
	}, []);

	return (
		<div>
			<SavingIndicator savingState={savingIndicator} />
			<div>
				{loadingDocument && <CircularProgress />}
				<div>
					<div
						className={`editor-container ${
							showSpelling && 'furigana-enabled'
						}`}
					>
						<Slate
							editor={editor}
							value={editorNodes}
							onChange={onEditorChange}
						>
							<div
								ref={editorContainer}
								style={{ position: 'relative' }}
							>
								<Toolbar
									selection={selection}
									showSentenceEditor={
										toolbarShowSentenceEditorHandle
									}
									showWordEditor={toolbarShowWordEditorHandle}
									setShowSpelling={toolbarShowSpellingHandle}
									showSpelling={showSpelling}
									updateDocument={updateDocument}
									isEditorDirty={isEditorDirty}
								/>
								<WordEditorModal
									visible={wordEditorVisible}
									close={closeWordEditorModal}
								/>
								<SentenceEditorModal
									visible={sentenceEditorVisible}
									close={closeSentenceEditorModal}
								/>
								{/*
								<DictPopupController
									rootElement={editorContainer}
									selection={selection}
								/>
								*/}
								<DraggableDictionary selection={selection} />
								<EditorDocument />
								{!loadingDocument && !dbDocument && (
									<Typography>Document not found</Typography>
								)}
							</div>
						</Slate>
					</div>
				</div>
			</div>
		</div>
	);
};

export default YiEditor;
