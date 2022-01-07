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
	const updateEditorDocument = useUpdateEditorDocument();
	const [loadingDocument, dbDocument] = useEditorDocument(id);

	const [showSpelling, setShowSpelling] = useState(false);
	const editor = useMemo(() => withReact(withYiLang(createEditor())), []);
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
			const serializedDocument = JSON.stringify(editorNodes);
			await updateEditorDocument.mutateAsync({
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
	}, [editor, editorNodes, handleError, id, updateEditorDocument]);

	const closeSentenceEditorModal = useCallback(() => {
		setSentenceEditorVisible(false);
	}, [setSentenceEditorVisible]);

	useEffect(() => {
		if (
			actionCountDebounced >= SAVE_EVERY_ACTIONS &&
			savingIndicator === 'IDLE'
		) {
			updateDocument();
			setActionCount(0);
		}
	}, [actionCountDebounced, savingIndicator, updateDocument]);

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
									showSentenceEditor={() => {
										setSentenceEditorVisible(true);
									}}
									showWordEditor={() => {
										setSavedSelection(editor.selection);
										setWordEditorVisible(true);
									}}
									updateDocument={updateDocument}
									setShowSpelling={(show: boolean) =>
										setShowSpelling(show)
									}
									showSpelling={showSpelling}
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
						<div>{JSON.stringify(editorNodes, null, '\t')}</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default YiEditor;
