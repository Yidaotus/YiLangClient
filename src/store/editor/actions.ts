import { BlockType, DocumentBlock } from 'Document/Block';
import {
	IFragment,
	FragmentSelectionResult,
	FragmentType,
	getFragmentsInRange,
	IWordFragmentData,
	normalizeRange,
	Fragment,
	FragmentData,
	isFragmentType,
} from 'Document/Fragment';
import { notUndefined, Option } from 'Document/Utility';
import { getUUID, UUID } from 'Document/UUID';
import { StoreAction } from 'store';
import { IDocument, IDocumentLink } from 'Document/Document';
import {
	addEntry,
	insertEmptyRow,
	mergeRow,
	moveEntry,
	removeEntry,
	scaleEntry,
	slideEntry,
	splitRow,
	swapEntries,
} from 'Document/RenderMap';
import { blockParsers, Configurator } from 'components/Editor/Blocks/Elements';
import { restoreCaretPosition, saveCaretPosition } from 'helpers/DomHelper';
import { ISelection } from 'hooks/useSelectedText';
import { setDictionaryEntryLink } from 'store/dictionary/actions';
import { DictionaryMutation } from 'store/dictionary/types';
import { initialize as user_init } from '@store/user/actions';
import { selectActiveLanguageFromState } from '@store/user/selectors';
import {
	DocumentBlockNormalized,
	EditorMutation,
	FragmentableStringNormalized,
	IEditorState,
	IFragmentLayer,
	WORKING_LAYER_NAME,
} from './types';
import * as DocumentService from '../../api/document.service';
import * as DictionaryService from '../../api/dictionary.service';
import { INITIAL_EDITOR_STATE } from './reducers';

type EditorAction<R = void> = StoreAction<
	EditorMutation | DictionaryMutation,
	R
>;

/**
 *
 * MAP FUNCTIONS
 *
 */

const scaleMapEntry =
	({ id, mode }: { id: UUID; mode: 'up' | 'down' }): EditorAction =>
	(dispatch, getState) => {
		const state = getState().editor.document;
		if (state) {
			const { renderMap } = state;

			const newMap = scaleEntry({ id, mode, renderMap });
			if (newMap) {
				dispatch({
					type: 'EDITOR_SET_RENDERMAP',
					payload: { renderMap: newMap },
				});
			}
		}
	};

const moveBlockEntry =
	({
		currentRow,
		currentColumn,
		targetRow,
		targetColumn,
	}: {
		currentRow: number;
		currentColumn: number;
		targetRow: number;
		targetColumn: number;
	}): EditorAction<void> =>
	(dispatch, getState) => {
		const state = getState().editor.document;
		if (state) {
			const { renderMap } = state;

			const newMap = moveEntry({
				currentRow,
				currentColumn,
				targetRow,
				targetColumn,
				renderMap,
			});
			if (newMap) {
				dispatch({
					type: 'EDITOR_SET_RENDERMAP',
					payload: { renderMap: newMap },
				});
			}
		}
	};

const moveBlock =
	({
		id,
		direction,
	}: {
		id: UUID;
		direction: 'up' | 'down';
	}): EditorAction<void> =>
	(dispatch, getState) => {
		const state = getState().editor.document;
		if (state) {
			const { renderMap } = state;

			const newMap = slideEntry({ id, direction, renderMap });
			if (newMap) {
				dispatch({
					type: 'EDITOR_SET_RENDERMAP',
					payload: { renderMap: newMap },
				});
			}
		}
	};

const mergeBlockRow =
	(row: number): EditorAction =>
	(dispatch, getState): void => {
		const state = getState().editor.document;
		if (state) {
			const { renderMap } = state;
			const newMap = mergeRow({ row, renderMap });
			if (newMap) {
				dispatch({
					type: 'EDITOR_SET_RENDERMAP',
					payload: { renderMap: newMap },
				});
			}
		}
	};

const swapMapEntries =
	({
		sourceRow,
		sourceColumn,
		targetRow,
		targetColumn,
	}: {
		sourceRow: number;
		sourceColumn: number;
		targetRow: number;
		targetColumn: number;
	}): EditorAction =>
	(dispatch, getState): void => {
		const state = getState().editor.document;
		if (state) {
			const { renderMap } = state;

			const newMap = swapEntries({
				sourceRow,
				sourceColumn,
				targetRow,
				targetColumn,
				renderMap,
			});
			if (newMap) {
				dispatch({
					type: 'EDITOR_SET_RENDERMAP',
					payload: { renderMap: newMap },
				});
			}
		}
	};

const splitBlockRow =
	(row: number): EditorAction =>
	(dispatch, getState): void => {
		const state = getState().editor.document;
		if (state) {
			const { renderMap } = state;

			const newMap = splitRow({ row, renderMap });
			if (newMap) {
				dispatch({
					type: 'EDITOR_SET_RENDERMAP',
					payload: { renderMap: newMap },
				});
			}
		}
	};

const addEntryMap =
	({ id, position }: { id: UUID; position: 'start' | 'end' }): EditorAction =>
	(dispatch, getState): void => {
		const state = getState().editor.document;
		if (state) {
			const { renderMap } = state;

			const newMap = addEntry({ id, position, renderMap });
			if (newMap) {
				dispatch({
					type: 'EDITOR_SET_RENDERMAP',
					payload: { renderMap: newMap },
				});
			}
		}
	};

/**
 *
 * FRAGMENT FUNCTIONS
 *
 */

const addFragment =
	(fragment: Fragment): EditorAction =>
	(dispatch, getState): void => {
		const state = getState().editor;
		const {
			fragmentables,
			fragmentLayers,
			selectedFragmentLayer,
			selection,
		} = state;
		const fragments = fragmentLayers.find(
			(layer) => layer.id === selectedFragmentLayer
		)?.fragments;
		const currentSelection = state.highlightedSelection || selection;
		if (currentSelection && fragments) {
			const { fragmentableId, fragmentableRange } =
				currentSelection.documentSelection;
			const fragmentable = fragmentables[fragmentableId];
			if (fragmentable) {
				const fragmentableFragments = fragmentable.fragments
					.map((frag) => fragments[frag])
					.filter(notUndefined);
				const sentence = getFragmentsInRange({
					range: fragmentableRange,
					fragments: fragmentableFragments,
				}).find(
					(fragSearch) =>
						fragSearch.fragment.type === 'Sentence' &&
						fragSearch.intersectType === 'inside'
				)?.fragment;
				// We change the document by inserting tags. We need to store and restore
				// the caret to reflect those changes without moving the selection
				// const restoreCaret = saveCaretPosition(boundaryNode);
				// caretRestore.current = restoreCaret;

				if (sentence && fragment.type === 'Word') {
					dispatch({
						type: 'EDITOR_ADD_WORD_TO_SENTENCE',
						payload: { fragmentId: sentence.id, word: fragment },
					});
				} else {
					dispatch({
						type: 'EDITOR_ADD_FRAGMENT',
						payload: { fragmentableId, fragment },
					});
				}
			}
		}
	};

const removeFragment =
	(id: UUID): EditorAction =>
	(dispatch) => {
		dispatch({
			type: 'EDITOR_REMOVE_FRAGMENT',
			payload: { fragmentId: id },
		});
	};

const clearHighlight =
	(): EditorAction =>
	(dispatch, getState): void => {
		const state = getState().editor;
		const { highlightedFragment } = state;
		if (highlightedFragment) {
			dispatch({
				type: 'EDITOR_REMOVE_FRAGMENT',
				payload: { fragmentId: highlightedFragment.fragmentId },
			});
		}
		dispatch({
			type: 'EDITOR_SET_HIGHLIGHTED_SELECTION',
			payload: { selection: null },
		});
		dispatch({
			type: 'EDITOR_SET_HIGHLIGHTED_FRAGMENT',
			payload: { fragmentIdentifier: null },
		});
	};

const highlightSelection =
	(color?: [number, number, number]): EditorAction =>
	(dispatch, getState): void => {
		const { selection } = getState().editor;
		if (selection) {
			const { blockId, fragmentableId, fragmentableRange } =
				selection.documentSelection;
			const lightColor = color || [
				0 + 360 * Math.random(),
				25 + 80 * Math.random(),
				85 + 10 * Math.random(),
			];
			const target: Fragment = {
				id: getUUID(),
				type: 'Mark',
				data: {
					type: 'Mark',
					color: `hsl(${lightColor[0]},${lightColor[1]}%,${lightColor[2]}%)`,
				},
				range: fragmentableRange,
			};

			dispatch({
				type: 'EDITOR_SET_HIGHLIGHTED_SELECTION',
				payload: { selection },
			});
			dispatch({
				type: 'EDITOR_ADD_FRAGMENT',
				payload: { blockId, fragmentableId, fragment: target },
			});
			dispatch({
				type: 'EDITOR_SET_HIGHLIGHTED_FRAGMENT',
				payload: {
					fragmentIdentifier: {
						blockId,
						fragmentableId,
						fragmentId: target.id,
					},
				},
			});
		}
	};

// const wrapSelectionWithFragment: StoreAction<DocumentMutation> = (
const wrapSelectionWithFragment =
	(fragment: FragmentData): EditorAction<UUID | null> =>
	(dispatch, getState) => {
		const state = getState().editor;
		const {
			fragmentables,
			selectedFragmentLayer,
			fragmentLayers,
			selection,
		} = state;
		const fragments = fragmentLayers.find(
			(layer) => layer.id === selectedFragmentLayer
		)?.fragments;
		const currentSelection = state.highlightedSelection || selection;
		if (currentSelection && fragments) {
			const { fragmentableId, fragmentableRange } =
				currentSelection.documentSelection;
			const fragmentable = fragmentables[fragmentableId];
			if (fragmentable) {
				const fragmentableFragments = fragmentable.fragments
					.map((frag) => fragments[frag])
					.filter(notUndefined);
				const inRange = getFragmentsInRange({
					range: fragmentableRange,
					fragments: fragmentableFragments,
				}).filter(
					(frag) =>
						frag.fragment.id !== fragmentable.highlightedFragment
				);

				// Only remove selected fragments if we are not inside a sentence and
				// adding a word
				const savedFragments: IFragment<IWordFragmentData>[] = [];
				if (
					inRange.length !== 1 ||
					inRange[0].intersectType !== 'inside' ||
					inRange[0].fragment.type !== 'Sentence' ||
					fragment.type !== 'Word'
				) {
					for (const fragmentInRange of inRange) {
						if (
							fragment.type === 'Sentence' &&
							fragmentInRange.fragment.type === 'Word'
						) {
							savedFragments.push(fragmentInRange.fragment);
						}
						dispatch({
							type: 'EDITOR_REMOVE_FRAGMENT',
							payload: {
								fragmentId: fragmentInRange.fragment.id,
							},
						});
					}
				}

				if (fragment.type === 'Sentence' && savedFragments.length > 0) {
					fragment.words.push(
						...savedFragments.map((frag) => ({
							...frag,
							range: normalizeRange({
								normalizer: fragmentableRange,
								target: frag.range,
							}),
						}))
					);
				}

				const fragmentId = getUUID();
				const target: IFragment<FragmentData> = {
					data: fragment,
					type: fragment.type,
					id: fragmentId,
					range: fragmentableRange,
				};

				dispatch(addFragment(target as Fragment));
				return fragmentId;
			}
		}
		return null;
	};

const unwrapSelectionForType =
	(fragmentType: FragmentType): EditorAction<Array<FragmentData>> =>
	(dispatch, getState) => {
		const state = getState().editor;
		const {
			fragmentables,
			selectedFragmentLayer,
			fragmentLayers,
			selection,
		} = state;
		const fragments = fragmentLayers.find(
			(layer) => layer.id === selectedFragmentLayer
		)?.fragments;
		if (selection && fragments) {
			const { fragmentableId, fragmentableRange } =
				selection.documentSelection;
			const fragmentable = fragmentables[fragmentableId];
			if (fragmentable) {
				const fragmentableFragments = fragmentable.fragments
					.map((frag) => fragments[frag])
					.filter(notUndefined);
				const targetSelectionFragments = getFragmentsInRange({
					range: fragmentableRange,
					fragments: fragmentableFragments,
				});

				const targetRootFragments: Fragment[] = [];
				const targetChildFragments: Array<
					Fragment & {
						parent: FragmentSelectionResult;
					}
				> = [];

				for (const rootFragment of targetSelectionFragments) {
					if (rootFragment.fragment.type === fragmentType) {
						targetRootFragments.push(rootFragment.fragment);
					}
					if (rootFragment.children) {
						const filteredChildFragments = rootFragment.children
							.filter(
								(childIntersect) =>
									childIntersect.fragment.type ===
									fragmentType
							)
							.map((childTypeIntersect) => ({
								...childTypeIntersect.fragment,
								parent: rootFragment,
							}));
						targetChildFragments.push(...filteredChildFragments);
					}
				}

				const childData: Array<FragmentData> = targetChildFragments.map(
					(f) => f.data
				);
				for (const childFrag of targetChildFragments) {
					dispatch({
						type: 'EDITOR_REMOVE_CHILDFRAGMENT',
						payload: {
							fragmentId: childFrag.parent.fragment.id,
							childId: childFrag.id,
						},
					});
				}

				const rootData: Array<FragmentData> = targetRootFragments.map(
					(f) => f.data
				);
				for (const frag of targetRootFragments) {
					dispatch({
						type: 'EDITOR_REMOVE_FRAGMENT',
						payload: { fragmentId: frag.id },
					});
				}
				return [...childData, ...rootData];
			}
		}
		return [];
	};

const removeBlock =
	(id: UUID): EditorAction =>
	(dispatch, getState): void => {
		const state = getState().editor.document;
		if (state) {
			const { renderMap } = state;

			const newMap = removeEntry({ id, renderMap });
			if (newMap) {
				dispatch({
					type: 'EDITOR_SET_RENDERMAP',
					payload: { renderMap: newMap },
				});
			}
			dispatch({
				type: 'EDITOR_REMOVE_BLOCK',
				payload: { id },
			});
		}
	};

const addBlock =
	(block: DocumentBlock): EditorAction =>
	(dispatch): void => {
		const fragments = block.fragmentables
			.map((fragmentable) => fragmentable.fragments)
			.flat();

		const fragmentables: Array<FragmentableStringNormalized> =
			block.fragmentables.map((fragmentable) => ({
				...fragmentable,
				fragments: fragments.map((frag) => frag.id),
			}));

		const newBlock: DocumentBlockNormalized = {
			...block,
			fragmentables: fragmentables.map((fragmentable) => fragmentable.id),
		};

		dispatch({
			type: 'EDITOR_PUSH_FRAGMENTS',
			payload: { fragments },
		});

		dispatch({
			type: 'EDITOR_PUSH_FRAGMENTABLES',
			payload: { fragmentables },
		});

		dispatch({
			type: 'EDITOR_ADD_BLOCK',
			payload: { block: newBlock },
		});
		dispatch(addEntryMap({ id: block.id, position: 'start' }));
	};

const toggleSpelling = (): EditorAction => (dispatch, getState) => {
	const state = getState().editor;
	dispatch({
		type: 'EDITOR_SET_SHOW_SPELLING',
		payload: { show: !state.showSpelling },
	});
};

const resetEditor = (): EditorAction => (dispatch) => {
	const resetState: IEditorState = INITIAL_EDITOR_STATE;
	dispatch({
		type: 'EDITOR_SET_STATE',
		payload: { editorState: resetState },
	});
};

const addFragmentLayer =
	(name: string, isDefault = false): EditorAction =>
	(dispatch) => {
		const newLayerId = getUUID();
		const newLayer: IFragmentLayer = {
			fragments: {},
			name,
			id: newLayerId,
		};
		dispatch({ type: 'EDITOR_ADD_LAYER', payload: { layer: newLayer } });
		if (isDefault) {
			dispatch({
				type: 'EDITOR_SET_ACTIVE_LAYER',
				payload: { id: newLayerId },
			});
		}
	};

const newDocument = (): EditorAction => (dispatch, getState) => {
	const activeLanguage = selectActiveLanguageFromState(getState().user);
	if (!activeLanguage) {
		throw new Error('No language selected!');
	}
	const normalizedDocument: IEditorState = {
		...INITIAL_EDITOR_STATE,
		document: {
			id: getUUID(),
			title: '',
			createdAt: new Date(),
			updatedAt: new Date(),
			lang: activeLanguage.key,
			renderMap: [],
			blocks: {},
		},
	};
	dispatch({
		type: 'EDITOR_SET_STATE',
		payload: { editorState: normalizedDocument },
	});
	dispatch(addFragmentLayer(WORKING_LAYER_NAME, true));
};

const updateFragment =
	(fragment: Fragment): EditorAction =>
	(dispatch) => {
		dispatch({
			type: 'EDITOR_UPDATE_FRAGMENT',
			payload: {
				fragment,
			},
		});
	};

type LoadDocumentAction = { type: 'new' } | { type: 'load'; id: UUID };

const loadDocument =
	(loadAction: LoadDocumentAction): EditorAction<Promise<void>> =>
	async (dispatch, getState) => {
		const { documentModified } = getState().editor;
		if (documentModified) {
			throw new Error(
				'Unsaved Document already loaded, please reset or save before loading a new Document'
			);
		}

		const { addedEntries, updatedEntries, addedTags, updatedTags } =
			getState().dictionary;
		if (
			addedEntries.length > 0 ||
			updatedEntries.length > 0 ||
			addedTags.length > 0 ||
			updatedTags.length > 0
		) {
			throw new Error(
				'Unsaved Dictionary updates! Please save before loading a new Document'
			);
		}

		switch (loadAction.type) {
			case 'load': {
				const { id } = loadAction;
				const activeLanguage = selectActiveLanguageFromState(
					getState().user
				);
				if (!activeLanguage) {
					throw new Error('No language selected!');
				}
				const fetchedDocument = await DocumentService.getDocument(id);
				if (!fetchedDocument) {
					throw new Error('Document not found!');
				}
				const dictIdsToLoad = [];
				const fragments: { [key: string]: Fragment } = {};
				const fragmentables: {
					[key: string]: FragmentableStringNormalized;
				} = {};
				const blocks: { [key: string]: DocumentBlockNormalized } = {};

				for (const block of fetchedDocument.blocks) {
					blocks[block.id] = {
						...block,
						fragmentables: block.fragmentables.map((f) => f.id),
					};
					for (const fragmentable of block.fragmentables) {
						fragmentables[fragmentable.id] = {
							...fragmentable,
							fragments: fragmentable.fragments.map((f) => f.id),
						};
						for (const fragment of fragmentable.fragments) {
							if (isFragmentType('Word')(fragment)) {
								dictIdsToLoad.push(fragment.data.dictId);
							}
							if (isFragmentType('Sentence')(fragment)) {
								dictIdsToLoad.push(
									...fragment.data.words.map(
										(word) => word.data.dictId
									)
								);
							}
							fragments[fragment.id] = fragment;
						}
					}
				}
				if (dictIdsToLoad.length > 0) {
					const dictEntries = await DictionaryService.getEntries({
						lang: activeLanguage.key,
						ids: dictIdsToLoad,
					});
					dispatch({
						type: 'DICTIONARY_PUSH_ENTRIES',
						payload: { entries: dictEntries },
					});
				}

				const layerId = getUUID();
				const normalizedDocument: IEditorState = {
					...INITIAL_EDITOR_STATE,
					fragmentLayers: [
						{
							id: layerId,
							name: WORKING_LAYER_NAME,
							fragments,
						},
						{
							id: getUUID(),
							name: 'Dictionary Layer',
							fragments: {},
						},
					],
					selectedFragmentLayer: layerId,
					document: {
						...fetchedDocument,
						blocks,
					},
					fragmentables,
				};
				dispatch({
					type: 'EDITOR_SET_STATE',
					payload: { editorState: normalizedDocument },
				});
				break;
			}
			case 'new': {
				dispatch(newDocument());
				break;
			}
			default:
		}
	};

const saveDocument =
	(): EditorAction<Promise<void>> => async (dispatch, getState) => {
		const state = getState().editor.document;
		if (state) {
			const { title, renderMap, blocks, id } = state;
			const { fragmentables, fragmentLayers } = getState().editor;
			const fragments = fragmentLayers.find(
				(layer) => layer.name === WORKING_LAYER_NAME
			)?.fragments;
			if (!fragments) {
				throw new Error(
					'Working Fragment Layer not loaded or corrupted!'
				);
			}
			const activeLanguage = selectActiveLanguageFromState(
				getState().user
			);
			if (!activeLanguage) {
				throw new Error('No language selected!');
			}

			let titleFromBlock;
			// User expects the first titleblock in rendering order to be the title
			// eslint-disable-next-line no-labels
			root: for (const renderRow of renderMap) {
				for (const renderColumn of renderRow) {
					const renderBlock = blocks[renderColumn.id];
					if (
						renderBlock &&
						renderBlock.type === 'Title' &&
						!renderBlock.config.subtitle
					) {
						const firstTitleBlock = renderBlock;
						const titleContent =
							fragmentables[firstTitleBlock.fragmentables[0]];
						titleFromBlock = titleContent.root;
						// eslint-disable-next-line no-labels
						break root;
					}
				}
			}

			const documentDenormalized: IDocument = {
				createdAt: new Date(),
				updatedAt: new Date(),
				lang: activeLanguage.key,
				id,
				title: titleFromBlock || title,
				renderMap,
				blocks: Object.values(blocks).map((block) => ({
					...block,
					fragmentables: block.fragmentables.map((fragmentableId) => {
						const fragmentable = fragmentables[fragmentableId];
						return {
							...fragmentable,
							fragments: fragmentable.fragments
								.map((fragmentId) => fragments[fragmentId])
								.filter(notUndefined),
						};
					}),
				})),
			};
			await DocumentService.save(documentDenormalized);
			dispatch({
				type: 'EDITOR_SET_DOCUMENT_MODIFIED',
				payload: { modified: false },
			});
		}
	};

const parseBlock = ({
	type,
	content,
	position,
}: {
	type: BlockType;
	content: string;
	position: number;
}): Option<DocumentBlock> => {
	const parser = blockParsers[type];
	if (parser) {
		return parser(content, position);
	}
	return null;
};

const configureBlock =
	({
		configurator,
		blockId,
	}: {
		configurator: Configurator;
		blockId: UUID;
	}): EditorAction =>
	(dispatch) => {
		dispatch({
			type: 'EDITOR_CONFIGURE_BLOCK',
			payload: { configurator, blockId },
		});
	};

const addEmptyMapRow =
	(rowIndex: number): EditorAction =>
	(dispatch, getState): void => {
		const state = getState().editor.document;
		if (state) {
			const { renderMap } = state;

			const newMap = insertEmptyRow({ rowIndex, renderMap });
			if (newMap) {
				dispatch({
					type: 'EDITOR_SET_RENDERMAP',
					payload: { renderMap: newMap },
				});
			}
		}
	};

const storePosition = (): EditorAction => (dispatch, getState) => {
	const { selection } = getState().editor;
	const root = document.getElementById(selection?.rootId || '');
	if (selection && root) {
		const caret = saveCaretPosition(root);
		if (selection && caret) {
			dispatch({
				type: 'EDITOR_SET_STORED_POSITION',
				payload: { position: { caret, selection } },
			});
		}
	}
};

const restorePosition =
	(offset = 0): EditorAction =>
	(dispatch, getState) => {
		const { storedPosition } = getState().editor;
		if (storedPosition) {
			dispatch({
				type: 'EDITOR_SET_SELECTION',
				payload: { selection: storedPosition.selection },
			});
			restoreCaretPosition({
				offset,
				caretPosition: storedPosition.caret,
			});
		}
	};

const setSelection =
	(selection: ISelection | null): EditorAction =>
	(dispatch): void => {
		dispatch({
			type: 'EDITOR_SET_SELECTION',
			payload: { selection },
		});
	};

const linkSelectionToDictionary =
	(dictEntryId: UUID): EditorAction =>
	(dispatch, getState) => {
		const { selection, document, highlightedSelection } = getState().editor;
		if (document) {
			const { id: documentId } = document;
			const currentSelection = highlightedSelection || selection;
			if (currentSelection) {
				const { fragmentableId, fragmentableRange } =
					currentSelection.documentSelection;
				const offset = fragmentableRange.start;
				const documentLink: IDocumentLink = {
					documentId,
					fragmentableId,
					offset,
				};
				dispatch(
					setDictionaryEntryLink({
						id: dictEntryId,
						link: documentLink,
					})
				);
			}
		}
	};

const deleteDocument =
	(id: UUID): EditorAction =>
	() => {
		DocumentService.remove(id);
	};

const initialize = (): EditorAction<Promise<void>> => async (dispatch) => {
	await dispatch(user_init());
};

const changeLayer =
	(id: UUID): EditorAction =>
	(dispatch) => {
		dispatch({ type: 'EDITOR_SET_ACTIVE_LAYER', payload: { id } });
	};

export {
	initialize,
	changeLayer,
	saveDocument,
	deleteDocument,
	setSelection,
	restorePosition,
	storePosition,
	clearHighlight,
	linkSelectionToDictionary,
	highlightSelection,
	mergeBlockRow,
	splitBlockRow,
	swapMapEntries,
	wrapSelectionWithFragment,
	unwrapSelectionForType,
	resetEditor,
	moveBlock,
	addFragment,
	addBlock,
	configureBlock,
	scaleMapEntry,
	moveBlockEntry,
	toggleSpelling,
	removeBlock,
	parseBlock,
	loadDocument,
	updateFragment,
	addEmptyMapRow,
	removeFragment,
};
