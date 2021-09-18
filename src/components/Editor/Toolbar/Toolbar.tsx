import './Toolbar.css';
import React, { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectedFragmentsSelector } from 'store/editor/selectors';
import { Divider, Modal } from 'antd';
import { ISelection, SELECTIONBLOCKER } from 'hooks/useSelectedText';
import {
	getFragmentTypesInSelection,
	IMarkFragmentData,
	ISentenceFragmentData,
	isFragmentDataType,
	IWordFragmentData,
} from 'Document/Fragment';
import {
	HighlightOutlined,
	PicRightOutlined,
	QuestionCircleOutlined,
	SearchOutlined,
	TranslationOutlined,
} from '@ant-design/icons';
import { IEditorState } from 'store/editor/types';
import {
	clearHighlight,
	highlightSelection,
	linkSelectionToDictionary,
	restorePosition,
	storePosition,
	unwrapSelectionForType,
	wrapSelectionWithFragment,
} from 'store/editor/actions';

import { IRootDispatch, IRootState } from 'store';

import {
	checkSelectedWordExists,
	removeEntry,
	saveOrUpdateEntryInput,
} from 'store/dictionary/actions';
import { ICaretPosition, restoreCaretPosition } from '@helpers/DomHelper';
import { selectActiveLookupSources } from '@store/user/selectors';
import { formatURL } from '@components/LookupSourceLink';
import HSLColorPicker from '@components/HSLColorPicker/HSLColorPicker';
import { UUID } from 'Document/UUID';
import WrapperItem, { IToolbarWrapperItem } from './Tools/WrapperItem';
import DropdownItem, { IToolbarDropdownItem } from './Tools/DropdownItem';
import ActionItem, { IToolbarActionItem } from './Tools/ActionItem';
import SimpleInput, { useSimpleInput } from './Modals/SimpleInput';
import Floating, { floatingReducer } from '../Popups/Floating';

import WordInput, { useWordInput } from './Modals/WordEditor/WordEditor';

export interface IToolbarProps {
	selection: ISelection | null;
	editorDocument: IEditorState;
}

export type ToolbarItem =
	| IToolbarWrapperItem
	| IToolbarDropdownItem
	| IToolbarActionItem;

const { confirm } = Modal;

/*
const markColors = [0, 1, 2, 3, 4, 5, 6, 7, 8].map((number) => {
	const start = (360 / 9) * number;
	const end = (360 / 9) * (number + 1);
	const range = end - start;
	const lightColor = [
		start + range * Math.random(),
		25 + 80 * Math.random(),
		85 + 10 * Math.random(),
	];
	return `hsl(${lightColor[0]},${lightColor[1]}%,${lightColor[2]}%`;
});
*/

type IToolbarState =
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

const Toolbar: React.FC = () => {
	const caretRestore = useRef<ICaretPosition | null>(null);
	const { simpleInputState, getUserInput } = useSimpleInput();
	const { wordInputState, getUserWord } = useWordInput();

	const dispatch: IRootDispatch = useDispatch();
	const selection = useSelector(
		(state: IRootState) => state.editor.selection
	);
	const lookupSources = useSelector(selectActiveLookupSources);

	const fragmentSelector = useMemo(() => selectedFragmentsSelector, []);
	const selectedFragments = useSelector(fragmentSelector);

	const [toolbarState, setToolbarState] =
		useState<IToolbarState>(defaultToolbarState);
	const [toolbarContainerState, dispatchToolbarContainerState] = useReducer(
		floatingReducer,
		{
			visible: false,
			position: {
				x: 0,
				y: 0,
				width: 0,
				height: 0,
			},
		}
	);

	useEffect(() => {
		if (
			!toolbarState.simpleInputVisible &&
			!toolbarState.wordInputVisible
		) {
			if (selection && !selection.collapsed) {
				dispatchToolbarContainerState({
					type: 'show',
					position: { ...selection.screenPosition, offsetY: 5 },
				});
			} else {
				dispatchToolbarContainerState({ type: 'hide' });
			}
		}
	}, [selection, toolbarState]);

	const [selectedColorValue, setSelectedColorValue] = useState(0);
	const saturation = 40;
	const lightness = 80;
	const selectedColor = useMemo(() => {
		return `hsl(${selectedColorValue}, ${saturation}%, ${lightness}%)`;
	}, [selectedColorValue]);

	const toolsActive = useMemo(() => {
		return getFragmentTypesInSelection(selectedFragments);
	}, [selectedFragments]);

	const toolVisible = useMemo(
		() => ({
			marker: !selectedFragments
				.filter((sf) => sf.fragment.type === 'Sentence')
				.find((sf) => sf.intersectType === 'inside'),
			wordMarker: true,
			sentenceMarker: true,
			lookup: true,
		}),
		[selectedFragments]
	);

	useEffect(() => {
		if (caretRestore.current) {
			restoreCaretPosition({
				caretPosition: caretRestore.current,
				offset: 0,
			});
			caretRestore.current = null;
		}
	}, [selection]);

	const toolbarItems: Array<ToolbarItem> = [
		{
			type: 'Wrapper',
			visible: toolVisible.marker,
			name: 'Mark',
			icon: <HighlightOutlined />,
			tooltip: 'Highlight selection',
			tooltipActive: 'Remove highlighted(s)',
			options: (
				<div
					className="toolbar-color-picker"
					data-type={SELECTIONBLOCKER}
				>
					<HSLColorPicker
						value={selectedColorValue}
						onChange={setSelectedColorValue}
						saturation={saturation}
						lightness={lightness}
					/>
				</div>
			),
			fragmentType: 'Mark',
			active: toolsActive.includes('Mark'),
			wrap: async () => {
				dispatch(storePosition());
				const fragment: IMarkFragmentData = {
					type: 'Mark',
					color: selectedColor,
				};
				dispatch(wrapSelectionWithFragment(fragment));
				dispatch(restorePosition());
			},
			unwrap: async () => {
				dispatch(storePosition());
				dispatch(unwrapSelectionForType('Mark'));
				dispatch(restorePosition());
			},
		},
		{
			type: 'Wrapper',
			visible: toolVisible.sentenceMarker,
			name: 'Sentence',
			icon: <PicRightOutlined />,
			tooltip: 'Add Sentence',
			tooltipActive: 'Sentence Word(s)',
			fragmentType: 'Sentence',
			active: toolsActive.includes('Sentence'),
			wrap: async () => {
				dispatch(storePosition());
				dispatch(highlightSelection());
				setToolbarState({
					actionBarVisible: false,
					simpleInputVisible: true,
					wordInputVisible: false,
				});
				const input = await getUserInput('Get User Input ...');
				if (input) {
					const sentenceFragment: ISentenceFragmentData = {
						type: 'Sentence',
						translation: input,
						words: [],
					};
					dispatch(wrapSelectionWithFragment(sentenceFragment));
				}
				dispatch(clearHighlight());
				dispatch(restorePosition());
				setToolbarState({
					actionBarVisible: true,
					simpleInputVisible: false,
					wordInputVisible: false,
				});
			},
			unwrap: async () => {
				dispatch(storePosition());
				dispatch(unwrapSelectionForType('Sentence'));
				dispatch(clearHighlight());
				dispatch(restorePosition());
				setToolbarState({
					actionBarVisible: true,
					simpleInputVisible: false,
					wordInputVisible: false,
				});
			},
		},
		{
			type: 'Wrapper',
			visible: toolVisible.wordMarker,
			name: 'Word',
			icon: <TranslationOutlined />,
			tooltip: 'Add Word',
			tooltipActive: 'Remove Word(s)',
			fragmentType: 'Word',
			active: toolsActive.includes('Word'),
			wrap: async () => {
				dispatch(storePosition());
				dispatch(highlightSelection());
				let success = true;
				const foundId = await dispatch(checkSelectedWordExists());
				if (foundId) {
					await confirm({
						title: 'Entry already found!',
						icon: <QuestionCircleOutlined />,
						content: `This entry is already found in your dictionary. Link Entry instead?`,
						okText: 'Yes',
						okType: 'primary',
						cancelText: 'No',
						onOk() {
							const wordFragment: IWordFragmentData = {
								type: 'Word',
								dictId: foundId,
							};
							const fragmentId = dispatch(
								wrapSelectionWithFragment(wordFragment)
							);
							if (!fragmentId) {
								throw new Error('No fragment entry');
							}
							dispatch(linkSelectionToDictionary(foundId));
							dispatch(clearHighlight());
						},
						onCancel() {
							dispatch(clearHighlight());
							dispatch(restorePosition());
						},
						afterClose() {
							setToolbarState({
								actionBarVisible: true,
								simpleInputVisible: false,
								wordInputVisible: false,
							});
						},
					});
				} else {
					setToolbarState({
						actionBarVisible: false,
						simpleInputVisible: false,
						wordInputVisible: true,
					});
					try {
						const editResult = await getUserWord(
							selection?.value || ''
						);
						if (!editResult) {
							throw new Error('No input recieved');
						}
						const dictEntryId = dispatch(
							saveOrUpdateEntryInput(editResult)
						);
						if (!dictEntryId) {
							throw new Error('Error saving entry');
						}

						let mainId: UUID | null = null;
						let rootId: UUID | null = null;
						if (typeof dictEntryId === 'string') {
							mainId = dictEntryId;
						} else {
							[mainId, rootId] = dictEntryId;
						}

						if (mainId) {
							const wordFragment: IWordFragmentData = {
								type: 'Word',
								dictId: mainId,
							};
							const fragmentId = dispatch(
								wrapSelectionWithFragment(wordFragment)
							);
							if (!fragmentId) {
								throw new Error('No fragment entry');
							}
							dispatch(linkSelectionToDictionary(mainId));
						}

						if (rootId) {
							dispatch(linkSelectionToDictionary(rootId));
						}
					} catch (e) {
						success = false;
					}
					dispatch(clearHighlight());
					if (!success) {
						dispatch(restorePosition());
					}
					setToolbarState({
						actionBarVisible: true,
						simpleInputVisible: false,
						wordInputVisible: false,
					});
				}
			},
			unwrap: async () => {
				dispatch(storePosition());
				const fragmentsData = await dispatch(
					unwrapSelectionForType('Word')
				);
				const wordFragmentData = fragmentsData.filter(
					isFragmentDataType('Word')
				);
				for (const wordData of wordFragmentData) {
					dispatch(removeEntry(wordData.dictId));
				}
				dispatch(clearHighlight());
				dispatch(restorePosition());
				setToolbarState({
					actionBarVisible: true,
					simpleInputVisible: false,
					wordInputVisible: false,
				});
			},
		},
		{
			type: 'Dropdown',
			name: 'Lookup sources',
			icon: <SearchOutlined />,
			items: lookupSources.map((source) => ({
				type: 'Action',
				name: source.name,
				action: () => {
					const url = formatURL({
						source,
						searchTerm: selection?.value || '',
					});
					window.open(url);
				},
			})),
			visible: toolVisible.lookup,
		},
	];

	return (
		<Floating state={toolbarContainerState}>
			{toolbarState.simpleInputVisible && (
				<div tabIndex={0} role="button" data-type={SELECTIONBLOCKER}>
					<SimpleInput {...simpleInputState} />
				</div>
			)}
			{toolbarState.wordInputVisible && (
				<div tabIndex={0} role="button" data-type={SELECTIONBLOCKER}>
					<WordInput {...wordInputState} />
				</div>
			)}
			{toolbarState.actionBarVisible && (
				<div
					className="toolbar"
					onMouseDown={(e) => {
						// We don't want to lose selection if the user clicks on the toolbar
						e.preventDefault();
					}}
					aria-hidden
				>
					{toolbarItems
						.filter((item) => item.visible)
						.map((item, index, items) => {
							let renderedItem = null;
							switch (item.type) {
								case 'Wrapper':
									renderedItem = <WrapperItem {...item} />;
									break;
								case 'Action':
									renderedItem = <ActionItem {...item} />;
									break;
								case 'Dropdown':
									renderedItem = <DropdownItem {...item} />;
									break;
								default:
							}
							return (
								<React.Fragment key={item.name}>
									{index >= items.length - 1 ? (
										renderedItem
									) : (
										<>
											{renderedItem}
											<Divider
												type="vertical"
												style={{
													margin: '0 0px !important',
													borderLeft:
														'1px solid rgb(0 0 0 / 27%)',
												}}
											/>
										</>
									)}
								</React.Fragment>
							);
						})}
				</div>
			)}
		</Floating>
	);
};

export default Toolbar;
