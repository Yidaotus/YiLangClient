import './WordEditor.css';
import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import { IDictionaryEntry } from 'Document/Dictionary';
import DictEntryEdit, {
	IWordInputRef,
	WordEditorMode,
} from '@components/DictionaryEntry/DictEntryEdit/DictEntryEdit';
import { Delete, Save, ArrowBack } from '@mui/icons-material';
import { Editor, Transforms, Text, Range, Selection } from 'slate';
import { useSlateStatic } from 'slate-react';
import { CustomText, WordElement } from '@components/Editor/YiEditor';
import { useDictionarySearch } from '@hooks/DictionaryQueryHooks';
import usePrevious from '@hooks/usePreviousState';
import { DictionaryEntryID } from 'Document/Utility';
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogContentText,
	Checkbox,
	DialogActions,
	IconButton,
	FormControlLabel,
	FormGroup,
	Stack,
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import LookupSourceMenu from './LookupSouceMenu';

export interface IWordInputProps {
	visible: boolean;
	close: (restoreSelection: boolean) => void;
}

const WordEditorModal: React.FC<IWordInputProps> = ({ visible, close }) => {
	const editor = useSlateStatic();
	const visibleBefore = usePrevious(visible);
	const dictEntryEdit = useRef<IWordInputRef>(null);
	const [editMode, setEditMode] = useState<WordEditorMode>('word');
	const [savedSelection, setSavedSelection] = useState<Selection>();
	const [entryKey, setEntryKey] = useState('');
	const [entryInDictionary, setEntryInDictionary] =
		useState<IDictionaryEntry>();
	const [fetchingRoot, rootInDictionary] = useDictionarySearch(entryKey);
	const [markOtherInstances, setMarkOtherInstances] = useState(true);
	const [saving, setSaving] = useState(false);

	const cardTitle = useMemo(() => {
		switch (editMode) {
			case 'word':
				return 'Word Editor';
			case 'tag':
				return 'Tag Editor';
			case 'root':
				return 'Root Editor';
			default:
				return 'Word Editor';
		}
	}, [editMode]);

	const wrapWithWord = useCallback(
		(entryId: DictionaryEntryID) => {
			if (entryId && savedSelection) {
				const vocab: WordElement = {
					type: 'word',
					dictId: entryId,
					isUserInput: true,
					children: [{ text: entryKey }],
				};
				Transforms.wrapNodes(editor, vocab, {
					split: true,
					at: savedSelection,
				});
				if (!markOtherInstances) {
					return;
				}
				const allLeaves = Editor.nodes(editor, {
					at: [[0], [editor.children.length - 1]],
					match: (e): e is CustomText => Text.isText(e),
				});
				const searchRegexp = new RegExp(entryKey, 'g');
				for (const [leafMatch, leafPath] of allLeaves) {
					const fillerVocab = { ...vocab, isUserInput: false };
					if (!Range.includes(savedSelection, leafPath)) {
						const foundRoots = String(leafMatch.text).matchAll(
							searchRegexp
						);
						const foundRoot = foundRoots.next();

						if (foundRoot.value?.index !== undefined) {
							// we split the node if we found any hits, so we can just wrap the first hit
							// and continue the loop. Since the loop makes use of the generator function
							// it will automatically iterate to the next (new)
							const nodeLocation = {
								anchor: {
									path: leafPath,
									offset: foundRoot.value.index,
								},
								focus: {
									path: leafPath,
									offset:
										foundRoot.value.index +
										foundRoot.value[0].length,
								},
							};
							Transforms.wrapNodes(editor, fillerVocab, {
								at: nodeLocation,
								split: true,
							});
						}
					}
				}
			}
		},
		[editor, entryKey, markOtherInstances, savedSelection]
	);

	useEffect(() => {
		if (visible && !visibleBefore && editor.selection) {
			setSavedSelection(editor.selection);
			const key = Editor.string(editor, editor.selection, {
				voids: true,
			});
			setEntryKey(key);
		}
	}, [editor, editor.selection, visible, visibleBefore]);

	useEffect(() => {
		if (rootInDictionary) {
			const foundInDictionary = rootInDictionary.find(
				(entry) => entry.key === entryKey
			);
			if (foundInDictionary) {
				setEntryInDictionary(foundInDictionary);
			} else {
				setEntryInDictionary(undefined);
			}
		}
	}, [entryKey, rootInDictionary]);

	const finish = async () => {
		setSaving(true);
		if (dictEntryEdit.current) {
			const editResult = await dictEntryEdit.current.finish();
			if (editResult.isDone && editResult.entryId) {
				wrapWithWord(editResult.entryId);
				close(false);
			}
		}
		if (entryInDictionary) {
			wrapWithWord(entryInDictionary.id);
			close(false);
		}
		setSaving(false);
	};

	const cancel = () => {
		if (dictEntryEdit.current) {
			const isDone = dictEntryEdit.current.cancel();
			if (isDone) {
				close(false);
			}
		}
		if (entryInDictionary) {
			close(false);
		}
	};

	return (
		<Dialog open={visible} onClose={() => close(true)}>
			<DialogTitle>
				<Stack
					justifyContent="space-between"
					direction="row"
					alignItems="center"
				>
					{cardTitle}
					<LookupSourceMenu searchTerm={entryKey} />
				</Stack>
			</DialogTitle>
			<DialogContent sx={{ minWidth: '500px' }}>
				<DialogContentText>
					{entryInDictionary ? (
						<span>
							{entryInDictionary.key} already found in Dictionary.
							Use found entry instead?
						</span>
					) : (
						<DictEntryEdit
							ref={dictEntryEdit}
							entryKey={entryKey}
							stateChanged={setEditMode}
						/>
					)}
				</DialogContentText>
				<DialogActions>
					<FormGroup>
						<FormControlLabel
							label="Mark all instances"
							control={
								<Checkbox
									checked={markOtherInstances}
									onChange={() => {
										setMarkOtherInstances(
											!markOtherInstances
										);
									}}
								/>
							}
						/>
					</FormGroup>
					{editMode === 'word' ? (
						<IconButton key="discard" onClick={cancel}>
							<Delete />
						</IconButton>
					) : (
						<IconButton key="discard" onClick={cancel}>
							<ArrowBack />
						</IconButton>
					)}
					<LoadingButton
						key="save"
						onClick={() => finish()}
						loading={saving}
						startIcon={<Save />}
					>
						Save
					</LoadingButton>
				</DialogActions>
			</DialogContent>
		</Dialog>
	);
};

export default React.memo(WordEditorModal);
