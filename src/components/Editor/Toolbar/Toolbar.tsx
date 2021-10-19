import './Toolbar.css';
import React, {
	useCallback,
	useEffect,
	useMemo,
	useReducer,
	useRef,
	useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Divider } from 'antd';

import { IRootDispatch } from 'store';

import { selectActiveLookupSources } from '@store/user/selectors';
import { ReactEditor, useSlate } from 'slate-react';
import {
	Editor,
	Element as SlateElement,
	Range,
	Transforms,
	Text,
	Path,
} from 'slate';
import {
	PicRightOutlined,
	SearchOutlined,
	TranslationOutlined,
} from '@ant-design/icons';
import {
	saveDictionary,
	saveOrUpdateEntryInput,
} from '@store/dictionary/actions';
import { formatURL } from '@components/LookupSourceLink';
import SimpleInput, { useSimpleInput } from './Modals/SimpleInput';
import Floating from '../Popups/Floating';

import WordInput, { useWordInput } from './Modals/WordEditor/WordEditor';
import ColorPicker from './Tools/ColorPicker';
import {
	highlightSelection,
	isNodeInSelection,
	WordElement,
} from '../CustomEditor';
import WrapperItem from './Tools/WrapperItem';
import DropdownItem from './Tools/DropdownItem';

type IToolbarState =
	| {
			actionBarVisible: false;
			simpleInputVisible: false;
			wordInputVisible: false;
	  }
	| {
			actionBarVisible: true;
			simpleInputVisible: false;
			wordInputVisible: false;
	  }
	| {
			actionBarVisible: false;
			simpleInputVisible: true;
			wordInputVisible: false;
	  }
	| {
			actionBarVisible: false;
			simpleInputVisible: false;
			wordInputVisible: true;
	  };

const defaultToolbarState: IToolbarState = {
	actionBarVisible: true,
	simpleInputVisible: false,
	wordInputVisible: false,
} as const;

const Toolbar: React.FC<{ rootElement: React.RefObject<HTMLElement> }> = ({
	rootElement,
}) => {
	const editor = useSlate();
	const { simpleInputState, getUserInput } = useSimpleInput();
	const { wordInputState, getUserWord } = useWordInput();

	const dispatch: IRootDispatch = useDispatch();
	const lookupSources = useSelector(selectActiveLookupSources);
	const [selectionNode, setSelectionNode] = useState<DOMRect | null>(null);

	const [toolbarState, setToolbarState] =
		useState<IToolbarState>(defaultToolbarState);

	useEffect(() => {
		if (
			!toolbarState.simpleInputVisible &&
			!toolbarState.wordInputVisible
		) {
			if (editor.selection && !Range.isCollapsed(editor.selection)) {
				const range = ReactEditor.toDOMRange(editor, editor.selection);
				const bounding = range.getBoundingClientRect();
				setSelectionNode(bounding);
				setToolbarState({
					actionBarVisible: true,
					simpleInputVisible: false,
					wordInputVisible: false,
				});
				const domSelection = document.getSelection();
				if (domSelection?.isCollapsed && !range.collapsed) {
					document.getSelection()?.removeAllRanges();
					document.getSelection()?.addRange(range);
				}
			} else {
				setToolbarState({
					actionBarVisible: false,
					simpleInputVisible: false,
					wordInputVisible: false,
				});
			}
		}
	}, [
		editor,
		editor.selection,
		toolbarState.simpleInputVisible,
		toolbarState.wordInputVisible,
	]);

	const wrapWithWord = async () => {
		if (editor.selection) {
			const savedSelection = { ...editor.selection };
			const range = ReactEditor.toDOMRange(editor, editor.selection);
			const bounding = range.getBoundingClientRect();
			setSelectionNode(bounding);
			const removeHighlights = highlightSelection(editor, savedSelection);
			setToolbarState({
				actionBarVisible: false,
				simpleInputVisible: false,
				wordInputVisible: true,
			});
			const root = Editor.string(editor, editor.selection, {
				voids: true,
			});
			const entry = await getUserWord(root);
			removeHighlights?.();
			if (entry) {
				const saveResult = dispatch(saveOrUpdateEntryInput(entry));
				if (saveResult) {
					let mainId;
					if (typeof saveResult === 'string') {
						mainId = saveResult;
					} else {
						[mainId] = saveResult;
					}
					const vocab: WordElement = {
						type: 'word',
						dictId: mainId,
						children: [{ text: '' }],
					};
					Transforms.wrapNodes(editor, vocab, {
						at: savedSelection,
						split: true,
					});
					/*
					const allLeafs = Editor.nodes(editor, {
						at: [[0], [editor.children.length - 1]],
						match: (e) => Text.isText(e),
					});
					const searchRegexp = new RegExp(root, 'g');
					for (const [leafMatch, leafPath] of allLeafs) {
						if (Text.isText(leafMatch)) {
							const foundRoots = String(leafMatch.text).matchAll(
								searchRegexp
							);
							const foundRoot = foundRoots.next();
							if (foundRoot.value?.index !== undefined) {
								// we split the node if we found any hits, so we can just wrap the first hit
								// and continue the loop. Since the loop makes use of the generator function
								// it will automatically iterate to the next (new)
								Transforms.wrapNodes(editor, vocab, {
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
					*/
				}
			}
			setToolbarState({
				actionBarVisible: true,
				simpleInputVisible: false,
				wordInputVisible: false,
			});
		}
	};

	return (
		<>
			<Floating
				arrow
				visible={toolbarState.wordInputVisible}
				parentElement={rootElement}
				relativeBounding={selectionNode}
			>
				<div tabIndex={0} role="button">
					<WordInput {...wordInputState} />
				</div>
			</Floating>
			<Floating
				arrow
				visible={toolbarState.actionBarVisible}
				parentElement={rootElement}
				relativeBounding={selectionNode}
			>
				{toolbarState.simpleInputVisible && (
					<div tabIndex={0} role="button">
						<SimpleInput {...simpleInputState} />
					</div>
				)}
				{toolbarState.actionBarVisible && (
					<div className="toolbar">
						<ColorPicker editor={editor} />
						<Divider
							type="vertical"
							style={{
								margin: '0 0px !important',
								borderLeft: '1px solid rgb(0 0 0 / 27%)',
							}}
						/>
						<WrapperItem
							icon={<TranslationOutlined />}
							tooltip="word"
							tooltipActive="word"
							active={isNodeInSelection(
								editor,
								editor.selection,
								'word'
							)}
							name="word"
							visible
							wrap={wrapWithWord}
							unwrap={async () => {
								Transforms.unwrapNodes(editor, {
									voids: true,
									match: (n) => {
										return (
											SlateElement.isElement(n) &&
											n.type === 'word'
										);
									},
								});
							}}
						/>
						<Divider
							type="vertical"
							style={{
								margin: '0 0px !important',
								borderLeft: '1px solid rgb(0 0 0 / 27%)',
							}}
						/>
						<WrapperItem
							icon={<PicRightOutlined />}
							tooltip="sentence"
							tooltipActive="sentence"
							active={isNodeInSelection(
								editor,
								editor.selection,
								'sentence'
							)}
							name="sentence"
							visible
							wrap={async () => {
								Transforms.wrapNodes(
									editor,
									{
										type: 'sentence',
										translation: 'teste',
										children: [{ text: '' }],
									},
									{
										split: true,
										voids: true,
									}
								);
							}}
							unwrap={async () => {
								Transforms.unwrapNodes(editor, {
									voids: true,
									match: (n) => {
										return (
											SlateElement.isElement(n) &&
											n.type === 'sentence'
										);
									},
								});
							}}
						/>
						{lookupSources.length > 0 && (
							<>
								<Divider
									type="vertical"
									style={{
										margin: '0 0px !important',
										borderLeft:
											'1px solid rgb(0 0 0 / 27%)',
									}}
								/>
								<DropdownItem
									icon={<SearchOutlined />}
									tooltip="lookup"
									name="lookup"
									visible
									items={lookupSources.map((source) => ({
										type: 'Action',
										name: source.name,
										action: () => {
											if (editor.selection) {
												const url = formatURL({
													source,
													searchTerm: Editor.string(
														editor,
														editor.selection
													),
												});
												window.open(url);
											}
										},
									}))}
								/>
							</>
						)}
					</div>
				)}
			</Floating>
		</>
	);
};

export default Toolbar;
