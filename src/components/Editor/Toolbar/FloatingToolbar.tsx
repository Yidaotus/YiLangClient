import './Toolbar.css';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Divider, Dropdown, Menu } from 'antd';
import { IRootDispatch } from 'store';
import { selectActiveLookupSources } from '@store/user/selectors';
import { ReactEditor, useSlateStatic } from 'slate-react';
import {
	Editor,
	Element as SlateElement,
	Range,
	Transforms,
	Text,
	BaseSelection,
} from 'slate';
import {
	DownOutlined,
	PicRightOutlined,
	SearchOutlined,
	TranslationOutlined,
} from '@ant-design/icons';
import { saveOrUpdateEntryInput } from '@store/dictionary/actions';
import { formatURL } from '@components/LookupSourceLink';
import Floating from '../Popups/Floating';
import WordInput, { useWordInput } from './Modals/WordEditor/WordEditor';
import ColorPicker from './Tools/ColorPicker';
import {
	BlockTypes,
	ElementTypeLabels,
	getTextBlockStyle,
	highlightSelection,
	isNodeInSelection,
	toggleBlockType,
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

export interface IToolbarProps {
	rootElement: React.RefObject<HTMLElement>;
	selection: BaseSelection;
}

const FloatingToolbar: React.FC<IToolbarProps> = ({
	rootElement,
	selection,
}) => {
	const editor = useSlateStatic();
	const blockType = getTextBlockStyle(editor);
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
			if (selection && !Range.isCollapsed(selection)) {
				const range = ReactEditor.toDOMRange(editor, selection);
				const bounding = range.getBoundingClientRect();
				setSelectionNode(bounding);
				setToolbarState({
					actionBarVisible: true,
					simpleInputVisible: false,
					wordInputVisible: false,
				});
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
		selection,
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
				}
			}
			setToolbarState({
				actionBarVisible: true,
				simpleInputVisible: false,
				wordInputVisible: false,
			});
		}
	};

	const blockMenu = (
		<Menu
			onMouseDown={(e) => {
				e.preventDefault();
			}}
			onClick={(e) => {
				e.domEvent.preventDefault();
			}}
		>
			{BlockTypes.map((menuBlockType) => (
				<Menu.Item
					disabled={blockType === menuBlockType}
					onClick={(e) => {
						setToolbarState({
							actionBarVisible: false,
							simpleInputVisible: false,
							wordInputVisible: false,
						});
						toggleBlockType(editor, menuBlockType);
					}}
				>
					{ElementTypeLabels[menuBlockType]}
				</Menu.Item>
			))}
		</Menu>
	);

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
						<Divider
							type="vertical"
							style={{
								margin: '0 0px !important',
								borderLeft: '1px solid rgb(0 0 0 / 27%)',
							}}
						/>
						<Dropdown overlay={blockMenu} trigger={['click']}>
							<Button
								style={{
									fontSize: '0.8em',
								}}
								onClick={(e) => {
									e.preventDefault();
								}}
							>
								{blockType === null || blockType === 'multiple'
									? 'Multiple'
									: ElementTypeLabels[blockType]}
								<DownOutlined />
							</Button>
						</Dropdown>
					</div>
				)}
			</Floating>
		</>
	);
};

export default FloatingToolbar;
