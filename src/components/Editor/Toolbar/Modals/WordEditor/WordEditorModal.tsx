import './WordEditor.css';
import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import { IDictionaryEntry } from 'Document/Dictionary';
import {
	SaveOutlined,
	ReadOutlined,
	StopOutlined,
	RollbackOutlined,
} from '@ant-design/icons';
import DictEntryEdit, {
	IWordInputRef,
	WordEditorMode,
} from '@components/DictionaryEntry/DictEntryEdit/DictEntryEdit';
import LookupSourceLink from '@components/LookupSourceLink';
import { Editor, Transforms, Text, Range, Selection } from 'slate';
import { useSlateStatic } from 'slate-react';
import { CustomText, WordElement } from '@components/Editor/CustomEditor';
import { useDictionarySearch } from '@hooks/DictionaryQueryHooks';
import { useLookupSources } from '@hooks/ConfigQueryHooks';
import usePrevious from '@hooks/usePreviousState';
import {
	Button,
	Checkbox,
	Classes,
	Dialog,
	Menu,
	Position,
	Spinner,
} from '@blueprintjs/core';
import { Popover2 } from '@blueprintjs/popover2';

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
	const lookupSources = useLookupSources();

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

	const menu = (
		<Menu>
			{lookupSources.map((source) => (
				<Menu.Item
					key={source.name}
					text={
						<LookupSourceLink
							source={source}
							searchTerm={entryKey}
						/>
					}
				/>
			))}
		</Menu>
	);

	const wrapWithWord = useCallback(
		(entryId: string) => {
			if (entryId && savedSelection) {
				const vocab: WordElement = {
					type: 'word',
					dictId: entryId,
					isUserInput: true,
					children: [{ text: '' }],
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
							Transforms.select(editor, nodeLocation);
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
		const foundInDictionary = rootInDictionary.find(
			(entry) => entry.key === entryKey
		);
		if (foundInDictionary) {
			setEntryInDictionary(foundInDictionary);
		} else {
			setEntryInDictionary(undefined);
		}
	}, [entryKey, rootInDictionary]);

	const finish = async () => {
		if (dictEntryEdit.current) {
			const editResult = await dictEntryEdit.current.finish();
			if (editResult.isDone && editResult.entryId) {
				await wrapWithWord(editResult.entryId);
				close(false);
			}
		}
		if (entryInDictionary) {
			await wrapWithWord(entryInDictionary.id);
			close(false);
		}
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
		<Dialog
			isOpen={visible}
			title={
				<div className="word-input-head">
					<ReadOutlined />
					{cardTitle}
					<Popover2 content={menu} position={Position.BOTTOM}>
						<Button icon="search" minimal />
					</Popover2>
				</div>
			}
			onClose={() => close(true)}
			canEscapeKeyClose
			canOutsideClickClose={false}
			shouldReturnFocusOnClose={false}
		>
			{fetchingRoot && <Spinner />}
			<div className={`word-input-root-form ${Classes.DIALOG_BODY}`}>
				{entryInDictionary ? (
					<span>
						{entryInDictionary.key} already found in Dictionary. Use
						found entry instead?
					</span>
				) : (
					<DictEntryEdit
						ref={dictEntryEdit}
						entryKey={entryKey}
						stateChanged={setEditMode}
					/>
				)}
				<Checkbox
					style={{ marginLeft: 'auto' }}
					checked={markOtherInstances}
					onChange={() => {
						setMarkOtherInstances(!markOtherInstances);
					}}
				>
					Mark all instances
				</Checkbox>
			</div>
			<div
				className={`word-input-root-form ${Classes.DIALOG_FOOTER_ACTIONS}`}
			>
				{editMode === 'word' ? (
					<Button
						icon={<StopOutlined />}
						key="discard"
						onClick={cancel}
					/>
				) : (
					<Button
						icon={<RollbackOutlined />}
						key="discard"
						onClick={cancel}
					/>
				)}
				<Button
					icon={<SaveOutlined />}
					key="save"
					onClick={() => finish()}
				/>
				,
			</div>
		</Dialog>
	);
};

export default React.memo(WordEditorModal);
