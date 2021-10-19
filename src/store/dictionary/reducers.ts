/* eslint-disable no-param-reassign */
import produce from 'immer';
import { ensureNever } from 'Document/Utility';
// import debugWords from './words.json';
import { DictionaryMutation, IDictionaryState } from './types';

// const USE_DEBUG_WORDS = false;
const INITIAL_DICTIAONARY = {};
/*
USE_DEBUG_WORDS
	? Object.entries(debugWords).reduce((acc, [key, value]) => {
			acc[key] = {
				id: getUUID(),
				key,
				lang: 'dft',
				translations: [...value.translation.split(',')],
				spelling: value.spelling,
				tags: [],
				dirty: null,
			};
			return acc;
	  }, {} as StoreMap<DirtyObject<IDictionaryEntry>>)
	: {};
	*/

const INITIAL_DICTIONARY_STATE: IDictionaryState = {
	entries: INITIAL_DICTIAONARY,
	tags: {},
};

export default (
	state: IDictionaryState = INITIAL_DICTIONARY_STATE,
	action: DictionaryMutation
): IDictionaryState =>
	produce(state, (draft: IDictionaryState) => {
		switch (action.type) {
			case 'DICTIONARY_SET_STATE': {
				const { dictionary } = action.payload;
				draft = dictionary;
				break;
			}
			case 'DICTIONARY_SET_TAG': {
				const { id, tag } = action.payload;
				draft.tags[id] = { ...tag, id };
				break;
			}
			case 'DICTIONARY_SET_ENTRY': {
				const { id, entry } = action.payload;
				draft.entries[id] = { ...entry, id };
				break;
			}
			case 'DICTIONARY_REMOVE_TAG': {
				const { id } = action.payload;

				const storeTag = draft.tags[id];
				if (storeTag) {
					delete draft.tags[id];
				}
				break;
			}
			case 'DICTIONARY_REMOVE_ENTRY': {
				const { id } = action.payload;
				const storeEntry = draft.entries[id];
				if (storeEntry) {
					delete draft.entries[id];
				}
				break;
			}
			case 'DICTIONARY_INITIALIZE': {
				const { entries } = action.payload;
				for (const prop of Object.getOwnPropertyNames(draft.entries)) {
					delete draft.entries[prop];
				}
				for (const entry of entries) {
					draft.entries[entry.id] = {
						...entry,
						dirty: null,
					};
				}
				break;
			}
			case 'DICTIONARY_RESET': {
				draft = INITIAL_DICTIONARY_STATE;
				break;
			}
			default: {
				const { type } = action;
				// Compile time check but don't check runtime because redux will call
				// our reducer with other types of actions!
				ensureNever(type);
				return state;
			}
		}
		return draft;
	});
