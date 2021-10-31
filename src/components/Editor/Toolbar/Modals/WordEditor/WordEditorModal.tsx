import './WordEditor.css';
import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import { Button, Dropdown, Menu, Spin, Modal, Checkbox } from 'antd';
import { IDictionaryEntry } from 'Document/Dictionary';
import {
	SearchOutlined,
	SaveOutlined,
	ReadOutlined,
	StopOutlined,
	RollbackOutlined,
	QuestionCircleOutlined,
} from '@ant-design/icons';
import DictEntryEdit, {
	IWordInputRef,
	WordEditorMode,
} from '@components/DictionaryEntry/DictEntryEdit/DictEntryEdit';
import LookupSourceLink from '@components/LookupSourceLink';
import { Editor, Transforms, Text, Range, Selection } from 'slate';
import { useSlateStatic } from 'slate-react';
import { WordElement } from '@components/Editor/CustomEditor';
import { useDictionarySearch } from '@hooks/DictionaryQueryHooks';
import { useLookupSources } from '@hooks/ConfigQueryHooks';
import usePrevious from '@hooks/usePreviousState';

export type WordInputResult = Omit<IDictionaryEntry, 'firstSeen' | 'id'>;

export interface IWordInputProps {
	visible: boolean;
	close: () => void;
	entryKey: string;
}

const { confirm } = Modal;

const WordEditorModal: React.FC<IWordInputProps> = ({
	visible,
	close,
	entryKey,
}) => {
	const editor = useSlateStatic();
	const visibleBefore = usePrevious(visible);
	const dictEntryEdit = useRef<IWordInputRef>(null);
	const [editMode, setEditMode] = useState<WordEditorMode>('word');
	const [savedSelection, setSavedSelection] = useState<Selection>();
	const [fetchingRoot, rootInDictionary] = useDictionarySearch(entryKey);
	const [markOtherInstances, setMarkOtherInstances] = useState(true);
	const lookupSources = useLookupSources();

	const showConfirm = useCallback(
		(root: string, cancel: () => void, ok: () => void) => {
			confirm({
				title: 'Insert word with found entry?',
				icon: <QuestionCircleOutlined />,
				content: (
					<div>
						<div>{`${root} is already in your dictionary! Do you want to insert it?`}</div>
						<Checkbox
							checked={markOtherInstances}
							onChange={(e) => {
								setMarkOtherInstances(!markOtherInstances);
							}}
						>
							Mark all instances
						</Checkbox>
					</div>
				),
				onOk() {
					ok();
				},
				onCancel() {
					cancel();
				},
				centered: true,
			});
		},
		[markOtherInstances]
	);

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
			{lookupSources.map((source) => {
				return (
					<Menu.Item key={source.name}>
						<LookupSourceLink
							source={source}
							searchTerm={entryKey}
						/>
					</Menu.Item>
				);
			})}
		</Menu>
	);

	const wrapWithWord = useCallback(
		async (entryId: string) => {
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
				const allLeafs = Editor.nodes(editor, {
					at: [[0], [editor.children.length - 1]],
					match: (e) => Text.isText(e),
				});
				const searchRegexp = new RegExp(entryKey, 'g');
				for (const [leafMatch, leafPath] of allLeafs) {
					const fillerVocab = { ...vocab, isUserInput: false };
					if (
						Text.isText(leafMatch) &&
						!Range.includes(savedSelection, leafPath)
					) {
						const foundRoots = String(leafMatch.text).matchAll(
							searchRegexp
						);
						const foundRoot = foundRoots.next();

						if (foundRoot.value?.index !== undefined) {
							// we split the node if we found any hits, so we can just wrap the first hit
							// and continue the loop. Since the loop makes use of the generator function
							// it will automatically iterate to the next (new)
							Transforms.wrapNodes(editor, fillerVocab, {
								at: {
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
								},
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
		if (visible && !visibleBefore) {
			setSavedSelection(editor.selection);

			const foundInDictionary = rootInDictionary.find(
				(entry) => entry.key === entryKey
			);
			if (foundInDictionary) {
				showConfirm(
					entryKey,
					() => {
						close();
					},
					() => {
						wrapWithWord(foundInDictionary.id);
						close();
					}
				);
			}
		}
	}, [
		close,
		entryKey,
		rootInDictionary,
		wrapWithWord,
		visible,
		showConfirm,
		visibleBefore,
		editor.selection,
	]);

	const finish = async () => {
		if (dictEntryEdit.current) {
			const editResult = await dictEntryEdit.current.finish();
			if (editResult.isDone && editResult.entryId) {
				wrapWithWord(editResult.entryId);
				close();
			}
		}
	};

	const cancel = () => {
		if (dictEntryEdit.current) {
			const isDone = dictEntryEdit.current.cancel();
			if (isDone) {
				close();
			}
		}
	};

	return (
		<Modal
			centered
			visible={visible}
			closable={false}
			title={
				<div className="word-input-head">
					<ReadOutlined />
					{cardTitle}
					<Dropdown overlay={menu} placement="bottomCenter">
						<Button
							shape="circle"
							size="small"
							type="primary"
							icon={<SearchOutlined />}
						/>
					</Dropdown>
				</div>
			}
			footer={[
				editMode === 'word' ? (
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
				),
				<Button
					icon={<SaveOutlined />}
					key="save"
					onClick={() => finish()}
				/>,
			]}
			onCancel={close}
		>
			<Spin spinning={fetchingRoot}>
				<div className="word-input-root-form">
					<DictEntryEdit
						ref={dictEntryEdit}
						entryKey={entryKey}
						stateChanged={setEditMode}
					/>
					<Checkbox
						checked={markOtherInstances}
						onChange={(e) => {
							setMarkOtherInstances(!markOtherInstances);
						}}
					>
						Mark all instances
					</Checkbox>
				</div>
			</Spin>
		</Modal>
	);
};

export default React.memo(WordEditorModal);
