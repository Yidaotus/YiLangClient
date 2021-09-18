/* eslint-disable no-param-reassign */
import { isFragmentType, normalizeRange } from 'Document/Fragment';
import produce from 'immer';
import { EditorMutation, IEditorState } from './types';

export const INITIAL_EDITOR_STATE: IEditorState = {
	documentModified: false,
	document: null,
	fragmentables: {},
	fragmentLayers: [],
	selectedFragmentLayer: null,
	movedBlock: null,
	highlightedFragment: null,
	highlightedSelection: null,
	storedPosition: null,
	showSpelling: true,
	title: 'default',
	selection: null,
};

function hasOwnProperty<X extends unknown, Y extends PropertyKey>(
	obj: X,
	prop: Y
): obj is X & Record<Y, unknown> {
	return Object.prototype.hasOwnProperty.call(obj, prop);
}

const getActiveFragments = (state: IEditorState) => {
	const activeLayerId = state.selectedFragmentLayer;
	if (!activeLayerId) {
		return null;
	}
	const activeLayer = state.fragmentLayers.find(
		(layer) => layer.id === activeLayerId
	);
	return activeLayer?.fragments;
};

export default (
	state: IEditorState = INITIAL_EDITOR_STATE,
	action: EditorMutation
): IEditorState =>
	produce(state, (draft: IEditorState) => {
		switch (action.type) {
			case 'EDITOR_SET_STATE': {
				const { editorState } = action.payload;
				draft = editorState;
				break;
			}
			case 'EDITOR_RESET': {
				draft = {
					...INITIAL_EDITOR_STATE,
				};
				break;
			}
			case 'EDITOR_SET_RENDERMAP': {
				const { renderMap } = action.payload;
				if (draft.document) {
					draft.document.renderMap = renderMap;
					draft.documentModified = true;
				}
				break;
			}
			case 'EDITOR_ADD_BLOCK': {
				const { block } = action.payload;
				const { document } = draft;
				if (document) {
					const { blocks } = document;
					blocks[block.id] = block;
					draft.movedBlock = block.id;
					draft.documentModified = true;
				}
				break;
			}
			case 'EDITOR_REMOVE_BLOCK': {
				const { id } = action.payload;
				const { document } = draft;
				if (document) {
					const { blocks } = document;
					delete blocks[id];
					draft.documentModified = true;
				}

				break;
			}
			case 'EDITOR_SET_MOVEDBLOCK': {
				const { id } = action.payload;
				draft.movedBlock = id;
				break;
			}
			case 'EDITOR_ADD_FRAGMENT': {
				const { fragment, fragmentableId } = action.payload;
				draft.fragmentables[fragmentableId].fragments.push(fragment.id);
				const fragments = getActiveFragments(draft);
				if (fragments) {
					fragments[fragment.id] = fragment;
					draft.documentModified = true;
				}
				break;
			}
			case 'EDITOR_REMOVE_FRAGMENT': {
				const { fragmentId } = action.payload;

				const fragments = getActiveFragments(draft);
				if (fragments) {
					for (const fragmentable of Object.values(
						draft.fragmentables
					)) {
						const index =
							fragmentable.fragments.indexOf(fragmentId);
						if (index !== -1) {
							fragmentable.fragments.splice(index, 1);
						}
					}
					delete fragments[fragmentId];
					draft.documentModified = true;
				}
				break;
			}
			case 'EDITOR_ADD_WORD_TO_SENTENCE': {
				const { fragmentId, word } = action.payload;
				const fragments = getActiveFragments(draft);
				if (fragments) {
					const fragment = fragments[fragmentId];
					if (fragment && fragment.type === 'Sentence') {
						const normalizedRange = normalizeRange({
							normalizer: fragment.range,
							target: word.range,
						});
						fragment.data.words.push({
							...word,
							range: normalizedRange,
						});
						draft.documentModified = true;
					}
				}
				break;
			}
			case 'EDITOR_UPDATE_FRAGMENT': {
				const { fragment } = action.payload;
				const fragments = getActiveFragments(draft);
				if (fragments) {
					const storedFragment = fragments[fragment.id];
					if (storedFragment) {
						fragments[fragment.id] = fragment;
						draft.documentModified = true;
					}
				}
				break;
			}
			case 'EDITOR_REMOVE_WORD_FROM_SENTENCE': {
				const { word, fragmentId } = action.payload;

				const fragments = getActiveFragments(draft);
				if (fragments) {
					const fragment = fragments[fragmentId];
					if (fragment && fragment.type === 'Sentence') {
						fragment.data.words = fragment.data.words.filter(
							(fragWord) => word.id !== fragWord.id
						);
					}
				}
				break;
			}
			case 'EDITOR_SET_SHOW_SPELLING': {
				const { show } = action.payload;

				for (const frag of Object.values(draft.fragmentables)) {
					frag.showSpelling = show;
				}
				draft.showSpelling = show;
				break;
			}
			case 'EDITOR_SET_HIGHLIGHTED_SELECTION': {
				const { selection } = action.payload;
				draft.highlightedSelection = selection;
				break;
			}
			case 'EDITOR_SET_HIGHLIGHTED_FRAGMENT': {
				const { fragmentIdentifier } = action.payload;
				if (fragmentIdentifier) {
					const { fragmentableId, fragmentId } = fragmentIdentifier;
					const fragmentable = draft.fragmentables[fragmentableId];
					if (fragmentable) {
						fragmentable.highlightedFragment = fragmentId;
					}
				} else if (draft.highlightedFragment) {
					const fragmentable =
						draft.fragmentables[
							draft.highlightedFragment.fragmentableId
						];
					if (fragmentable) {
						fragmentable.highlightedFragment = undefined;
					}
				}

				draft.highlightedFragment = fragmentIdentifier;
				break;
			}
			case 'EDITOR_REMOVE_CHILDFRAGMENT': {
				const { childId, fragmentId } = action.payload;
				const fragments = getActiveFragments(draft);
				if (fragments) {
					const targetFragment = fragments[fragmentId];
					if (
						targetFragment &&
						isFragmentType('Sentence')(targetFragment)
					) {
						targetFragment.data.words =
							targetFragment.data.words.filter(
								(word) => word.id !== childId
							);
						draft.documentModified = true;
					}
				}
				break;
			}
			case 'EDITOR_PUSH_FRAGMENTS': {
				const { fragments } = action.payload;
				const storeFragments = getActiveFragments(draft);
				if (fragments && storeFragments) {
					for (const fragment of fragments) {
						storeFragments[fragment.id] = fragment;
						draft.documentModified = true;
					}
				}
				break;
			}
			case 'EDITOR_PUSH_FRAGMENTABLES': {
				const { fragmentables } = action.payload;
				for (const fragmentable of fragmentables) {
					draft.fragmentables[fragmentable.id] = fragmentable;
					draft.documentModified = true;
				}
				break;
			}
			case 'EDITOR_CONFIGURE_BLOCK': {
				const { configurator, blockId } = action.payload;
				const { document } = draft;
				if (document) {
					const block = document.blocks[blockId];
					if (
						block.config &&
						hasOwnProperty(block.config, configurator.parameter)
					) {
						const value =
							typeof configurator.value === 'function'
								? // eslint-disable-next-line @typescript-eslint/no-explicit-any
								  configurator.value(block.config as any)
								: configurator.value;
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						draft.documentModified = true;
						block.config[configurator.parameter] = value;
					}
				}
				break;
			}
			case 'EDITOR_SET_SELECTION': {
				const { selection } = action.payload;
				draft.selection = selection;
				break;
			}
			case 'EDITOR_SET_STORED_POSITION': {
				const { position } = action.payload;
				draft.storedPosition = position;
				break;
			}
			case 'EDITOR_SET_DOCUMENT_MODIFIED': {
				const { modified } = action.payload;
				draft.documentModified = modified;
				break;
			}
			case 'EDITOR_SET_ACTIVE_LAYER': {
				const { id } = action.payload;
				draft.selectedFragmentLayer = id;
				break;
			}
			case 'EDITOR_ADD_LAYER': {
				const { layer } = action.payload;
				draft.fragmentLayers.push(layer);
				break;
			}
			default:
			// ensureNever(action);
		}
		return draft;
	});
