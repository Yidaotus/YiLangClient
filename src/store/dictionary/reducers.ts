/* eslint-disable no-param-reassign */
import { getUUID, UUID } from 'Document/UUID';
import produce from 'immer';
import { StoreMap } from 'store';
import { IDictionaryEntry } from 'Document/Dictionary';
import { ensureNever } from 'Document/Utility';
import debugWords from './words.json';
import { DictionaryMutation, IDictionaryState } from './types';

const USE_DEBUG_WORDS = false;
const INITIAL_DICTIAONARY = USE_DEBUG_WORDS
	? Object.entries(debugWords).reduce((acc, [key, value]) => {
			acc[key] = {
				id: getUUID(),
				key,
				lang: 'dft',
				translations: [...value.translation.split(',')],
				spelling: value.spelling,
				tags: [],
				createdAt: new Date(),
			};
			return acc;
	  }, {} as StoreMap<IDictionaryEntry>)
	: {};

const INITIAL_DICTIONARY_STATE: IDictionaryState = {
	dictionary: INITIAL_DICTIAONARY,
	tags: {},
	addedEntries: new Array<UUID>(),
	updatedEntries: new Array<UUID>(),
	removedEntries: new Array<UUID>(),
	addedTags: new Array<UUID>(),
	updatedTags: new Array<UUID>(),
	removedTags: new Array<UUID>(),
};

export default (
	state: IDictionaryState = INITIAL_DICTIONARY_STATE,
	action: DictionaryMutation
): IDictionaryState =>
	produce(state, (draft: IDictionaryState) => {
		switch (action.type) {
			case 'DICTIONARY_RESET_TAG_DELTA': {
				draft.addedTags = [];
				draft.updatedTags = [];
				draft.removedTags = [];
				break;
			}
			case 'DICTIONARY_RESET_ENTRY_DELTA': {
				draft.addedEntries = [];
				draft.updatedEntries = [];
				draft.removedEntries = [];
				break;
			}
			case 'DICTIONARY_SET_STATE': {
				const { dictionary } = action.payload;
				draft = dictionary;
				break;
			}
			case 'DICTIONARY_PUSH_ENTRIES': {
				const { entries } = action.payload;
				for (const entry of entries) {
					draft.dictionary[entry.id] = entry;
				}
				break;
			}
			case 'DICTIONARY_CACHE_ENTRY': {
				const { entry } = action.payload;
				draft.dictionary[entry.id] = entry;
				break;
			}
			case 'DICTIONARY_ADD_ENTRY': {
				const { entry } = action.payload;
				draft.dictionary[entry.id] = entry;
				draft.addedEntries.push(entry.id);
				break;
			}
			case 'DICTIONARY_REMOVE_TAG': {
				const { id } = action.payload;
				const { tags, updatedTags, addedTags } = draft;

				const inUpdated = updatedTags.indexOf(id);
				if (inUpdated !== -1) {
					updatedTags.splice(inUpdated, 1);
				}
				const inAdded = addedTags.indexOf(id);
				if (inAdded !== -1) {
					addedTags.splice(inAdded, 1);
				}
				/* TODO: Do we really want to delete the dictionary entry?!
				if (inAdded === -1 && inUpdated === -1) {
					removedEntries.push(id);
				}
				*/
				delete tags[id];
				break;
			}
			case 'DICTIONARY_REMOVE_ENTRY': {
				const { id } = action.payload;
				const { dictionary, updatedEntries, addedEntries } = draft;
				// TODO also check added tags!
				const inUpdated = updatedEntries.indexOf(id);
				if (inUpdated !== -1) {
					updatedEntries.splice(inUpdated, 1);
				}
				const inAdded = addedEntries.indexOf(id);
				if (inAdded !== -1) {
					addedEntries.splice(inAdded, 1);
				}
				/* TODO: Do we really want to delete the dictionary entry?!
				if (inAdded === -1 && inUpdated === -1) {
					removedEntries.push(id);
				}
				*/
				delete dictionary[id];
				break;
			}
			case 'DICTIONARY_UPDATE_TAG': {
				const { id, tag } = action.payload;
				const { tags, updatedTags } = draft;
				tags[id] = tag;
				if (updatedTags.indexOf(id) < 0) {
					updatedTags.push(id);
				}
				break;
			}
			case 'DICTIONARY_ADD_CHANGED_ENTRY': {
				const { id } = action.payload;
				const { updatedEntries } = draft;
				if (updatedEntries.indexOf(id) < 0) {
					updatedEntries.push(id);
				}
				break;
			}
			case 'DICTIONARY_CHANGE_ENTRY': {
				const { id, entry } = action.payload;
				const { dictionary } = draft;
				dictionary[id] = entry;
				break;
			}
			case 'DICTIONARY_SET_LINK': {
				const { id, link } = action.payload;
				const entry = draft.dictionary[id];
				if (entry) {
					entry.firstSeen = link;
				}
				break;
			}
			case 'DICTIONARY_ADD_TAG': {
				const { tag } = action.payload;
				draft.tags[tag.id] = tag;
				// TODO Check if already added
				draft.addedTags.push(tag.id);
				break;
			}
			case 'DICTIONARY_INITIALIZE': {
				const { entries } = action.payload;
				const { dictionary } = draft;
				for (const prop of Object.getOwnPropertyNames(dictionary)) {
					delete dictionary[prop];
				}
				for (const entry of entries) {
					dictionary[entry.entryId] = entry;
				}
				break;
			}
			case 'DICTIONARY_SET_TAGS': {
				const { tags } = action.payload;
				draft.tags = tags;
				break;
			}
			case 'DICTIONARY_SET_ENTRIES': {
				const { entries } = action.payload;
				draft.dictionary = entries;
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
