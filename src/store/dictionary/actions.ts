import { IEntryFormFields } from '@components/DictionaryEntry/EntryForm/EntryForm';
import { selectActiveLanguageFromState } from '@store/user/selectors';
import {
	applyDictionaryDelta,
	getDictionary,
	searchDictionary,
} from 'api/dictionary.service';
import { applyTagsDelta, getTags } from 'api/tags.service';
import { IDictionaryEntry, IDictionaryTag } from 'Document/Dictionary';
import { IDocumentLink } from 'Document/Document';
import { notUndefined } from 'Document/Utility';
import { getUUID, UUID } from 'Document/UUID';
import { StoreAction } from 'store';
import { DictionaryMutation } from './types';

type DictionaryAction<R = void> = StoreAction<DictionaryMutation, R>;

const changeEntry =
	({
		id,
		entryData,
	}: {
		id: UUID;
		entryData: Partial<IDictionaryEntry>;
	}): DictionaryAction =>
	(dispatch, getState) => {
		const currentEntry = getState().dictionary.dictionary[id];
		if (currentEntry) {
			dispatch({
				type: 'DICTIONARY_CHANGE_ENTRY',
				payload: {
					id,
					entry: {
						...currentEntry,
						...entryData,
					},
				},
			});
		}
	};

const updateEntry =
	({
		id,
		entryData,
	}: {
		id: UUID;
		entryData: Partial<IDictionaryEntry>;
	}): DictionaryAction =>
	(dispatch, getState) => {
		const currentEntry = getState().dictionary.dictionary[id];
		if (currentEntry) {
			dispatch({
				type: 'DICTIONARY_CHANGE_ENTRY',
				payload: {
					id,
					entry: {
						...currentEntry,
						...entryData,
					},
				},
			});
			dispatch({
				type: 'DICTIONARY_ADD_CHANGED_ENTRY',
				payload: {
					id,
				},
			});
		}
	};

const updateTag =
	({
		id,
		tagData,
	}: {
		id: UUID;
		tagData: Partial<IDictionaryTag>;
	}): DictionaryAction =>
	(dispatch, getState) => {
		const currentTag = getState().dictionary.tags[id];
		if (currentTag) {
			dispatch({
				type: 'DICTIONARY_UPDATE_TAG',
				payload: {
					id,
					tag: {
						...currentTag,
						...tagData,
					},
				},
			});
		}
	};

const createTag =
	(tag: Omit<IDictionaryTag, 'id'>): DictionaryAction<UUID> =>
	(dispatch) => {
		const tagId = getUUID();
		dispatch({
			type: 'DICTIONARY_ADD_TAG',
			payload: {
				tag: { ...tag, id: tagId },
			},
		});
		return tagId;
	};

const addTag =
	(tag: IDictionaryTag): DictionaryAction =>
	(dispatch) => {
		dispatch({
			type: 'DICTIONARY_ADD_TAG',
			payload: { tag },
		});
	};

const fetchTags =
	(lang: string): DictionaryAction<Promise<void>> =>
	async (dispatch) => {
		const tags = (await getTags(lang)) || [];
		const tagMap = tags.reduce<{
			[key: string]: IDictionaryTag;
		}>((acc, entry) => {
			acc[entry.id] = entry;
			return acc;
		}, {});

		dispatch({
			type: 'DICTIONARY_SET_TAGS',
			payload: { tags: tagMap },
		});
	};

const fetchDictionary =
	(): DictionaryAction<Promise<void>> => async (dispatch, getState) => {
		const activeLanguage = selectActiveLanguageFromState(getState().user);
		if (!activeLanguage) {
			throw Error('No Language selected!');
		}
		const dictionaryState = getState().dictionary;
		const hasDelta =
			dictionaryState.addedEntries.length > 0 ||
			dictionaryState.updatedEntries.length > 0 ||
			dictionaryState.removedEntries.length > 0;

		if (hasDelta) {
			throw new Error(
				`Outstanding dictionary delta. Please save first before loading the dicitonary again!`
			);
		}
		const entries = (await getDictionary(activeLanguage.key)) || [];
		const entriesMap = entries.reduce<{
			[key: string]: IDictionaryEntry;
		}>((acc, entry) => {
			acc[entry.id] = entry;
			return acc;
		}, {});

		const tags = (await getTags(activeLanguage.key)) || [];
		const tagMap = tags.reduce<{
			[key: string]: IDictionaryTag;
		}>((acc, entry) => {
			acc[entry.id] = entry;
			return acc;
		}, {});

		dispatch({
			type: 'DICTIONARY_RESET',
			payload: null,
		});
		dispatch({
			type: 'DICTIONARY_SET_TAGS',
			payload: { tags: tagMap },
		});
		dispatch({
			type: 'DICTIONARY_SET_ENTRIES',
			payload: { entries: entriesMap },
		});
	};

const resetDictionary = (): DictionaryAction => (dispatch) => {
	dispatch({ type: 'DICTIONARY_RESET', payload: null });
};

const saveTags =
	(): DictionaryAction<Promise<void>> => async (dispatch, getState) => {
		const { tags, addedTags, updatedTags, removedTags } =
			getState().dictionary;

		const updatedTagsToSave = updatedTags
			.map((id) => tags[id])
			.filter(notUndefined);
		const addedTagsToSave = addedTags
			.map((id) => tags[id])
			.filter(notUndefined);

		if (
			updatedTagsToSave.length > 0 ||
			addedTagsToSave.length > 0 ||
			removedTags.length > 0
		) {
			await applyTagsDelta({
				removedTags: [...removedTags.values()],
				updatedTags: updatedTagsToSave,
				addedTags: addedTagsToSave,
			});
			dispatch({ type: 'DICTIONARY_RESET_TAG_DELTA', payload: null });
		}
	};

const saveDictionary =
	(): DictionaryAction<Promise<void>> => async (dispatch, getState) => {
		const { dictionary, addedEntries, updatedEntries, removedEntries } =
			getState().dictionary;

		const updatedEntriesToSave = updatedEntries
			.map((id) => dictionary[id])
			.filter(notUndefined);
		const addedEntriesToSave = addedEntries
			.map((id) => dictionary[id])
			.filter(notUndefined);

		if (
			updatedEntriesToSave.length > 0 ||
			addedEntriesToSave.length > 0 ||
			removedEntries.length > 0
		) {
			await applyDictionaryDelta({
				removedEntries: [...removedEntries.values()],
				updatedEntries: updatedEntriesToSave,
				addedEntries: addedEntriesToSave,
			});
		}
		dispatch({ type: 'DICTIONARY_RESET_ENTRY_DELTA', payload: null });
	};

const cacheDictionaryEntry =
	(entry: IDictionaryEntry): DictionaryAction =>
	(dispatch, getState) => {
		const { dictionary } = getState().dictionary;
		if (!dictionary[entry.id]) {
			dispatch({ type: 'DICTIONARY_CACHE_ENTRY', payload: { entry } });
		}
	};

const addWordToDictionary =
	(word: Omit<IDictionaryEntry, 'id'>): DictionaryAction<UUID | null> =>
	(dispatch, getState): UUID => {
		const activeLanguage = selectActiveLanguageFromState(getState().user);
		if (!activeLanguage) {
			throw Error('No Language selected!');
		}
		const dictEntryId = getUUID();
		const dictEntry = {
			...word,
			id: dictEntryId,
			lang: activeLanguage.key,
			createdAt: new Date(),
		};
		dispatch({
			type: 'DICTIONARY_ADD_ENTRY',
			payload: { entry: dictEntry },
		});
		return dictEntryId;
	};

const setDictionaryEntryLink =
	({ id, link }: { id: UUID; link: IDocumentLink }): DictionaryAction =>
	(dispatch) => {
		dispatch({ type: 'DICTIONARY_SET_LINK', payload: { id, link } });
	};

const removeEntry =
	(id: UUID): DictionaryAction =>
	(dispatch) => {
		dispatch({ type: 'DICTIONARY_REMOVE_ENTRY', payload: { id } });
	};

const removeEntryRemote =
	(id: UUID): DictionaryAction<Promise<void>> =>
	async () => {
		return applyDictionaryDelta({
			removedEntries: [id],
			addedEntries: [],
			updatedEntries: [],
		});
	};

const removeTag =
	(id: UUID): DictionaryAction =>
	(dispatch) => {
		dispatch({ type: 'DICTIONARY_REMOVE_TAG', payload: { id } });
	};

const removeTagRemote =
	(id: UUID): DictionaryAction =>
	() => {
		return applyTagsDelta({
			removedTags: [id],
			addedTags: [],
			updatedTags: [],
		});
	};

export type IDictionaryEntryInput = Omit<
	IDictionaryEntry,
	'firstSeen' | 'id' | 'tags' | 'root'
> & {
	id?: UUID;
	tags: Array<IDictionaryTag | UUID>;
	root: UUID | IEntryFormFields;
};

const saveEntryRemote =
	(
		entry: IDictionaryEntryInput,
		update = false
	): DictionaryAction<Promise<void>> =>
	async (dispatch, getState) => {
		const activeLanguage = selectActiveLanguageFromState(getState().user);
		if (!activeLanguage) {
			throw Error('No Language selected!');
		}
		if (entry) {
			const addedTags = [];
			const addedEntries = [];
			const updatedEntries = [];
			let rootId: UUID | null;
			if (typeof entry.root === 'object') {
				const normalizedRootTags = new Array<UUID>();
				for (const rootTag of entry.root.tags) {
					let rootTagId: UUID;
					if (typeof rootTag === 'object') {
						rootTagId = getUUID();
						addedTags.push({
							...rootTag,
							id: rootTagId,
							lang: activeLanguage.key,
						});
					} else {
						rootTagId = rootTag;
					}
					normalizedRootTags.push(rootTagId);
				}
				const normalizedRoot = {
					...entry.root,
					tags: normalizedRootTags,
					// TODO We do NOT support double nested root creation
					root: entry.root.root as UUID,
					lang: activeLanguage.key,
				};
				rootId = getUUID();
				addedEntries.push({
					...normalizedRoot,
					id: rootId,
					lang: activeLanguage.key,
				});
			} else {
				rootId = entry.root;
			}
			const normalizedTags = new Array<UUID>();
			for (const tag of entry.tags) {
				let tagId: UUID;
				if (typeof tag === 'object') {
					tagId = getUUID();
					addedTags.push({
						...tag,
						id: tagId,
						lang: activeLanguage.key,
					});
				} else {
					tagId = tag;
				}
				normalizedTags.push(tagId);
			}

			const normalizedWord = {
				...entry,
				tags: normalizedTags,
				root: rootId || undefined,
				lang: activeLanguage.key,
			};
			if (update) {
				updatedEntries.push(normalizedWord);
			} else {
				addedEntries.push({ ...normalizedWord, id: getUUID() });
			}
			await applyTagsDelta({
				addedTags,
				removedTags: [],
				updatedTags: [],
			});
			await applyDictionaryDelta({
				addedEntries,
				removedEntries: [],
				updatedEntries,
			});
		}
	};

const checkSelectedWordExists =
	(): DictionaryAction<Promise<UUID | null>> =>
	async (dispatch, getState) => {
		const { selection } = getState().editor;
		if (!selection) {
			return null;
		}
		const searchValue = selection.value.trim().toLocaleLowerCase();
		const { dictionary } = getState().dictionary;

		// Check local dictionary
		const wordInLocalDictionay = Object.values(dictionary)
			.filter(notUndefined)
			.find((entry) => entry.key.toLocaleLowerCase() === searchValue);
		if (wordInLocalDictionay) {
			return wordInLocalDictionay.id;
		}

		// check remote dictionary
		const activeLanguage = selectActiveLanguageFromState(getState().user);
		if (!activeLanguage) {
			throw Error('No Language selected!');
		}

		const wordsInRemoteDictionary = await searchDictionary({
			key: searchValue,
			lang: activeLanguage.key,
		});
		if (!wordsInRemoteDictionary) {
			return null;
		}
		const foundExactWord = wordsInRemoteDictionary.find(
			(entry) => entry.key.toLocaleLowerCase() === searchValue
		);
		if (foundExactWord) {
			dispatch(cacheDictionaryEntry(foundExactWord));
			return foundExactWord.id;
		}
		return null;
	};

const saveOrUpdateEntryInput =
	(
		entry: IDictionaryEntryInput
	): DictionaryAction<UUID | [UUID, UUID] | null> =>
	(dispatch) => {
		let resultId: UUID | [UUID, UUID] | null = null;
		let rootId: UUID | null = null;
		if (entry) {
			if (typeof entry.root === 'object') {
				const normalizedRootTags = new Array<UUID>();
				for (const rootTag of entry.root.tags) {
					let rootTagId: UUID;
					if (typeof rootTag === 'object') {
						rootTagId = dispatch(createTag(rootTag));
					} else {
						rootTagId = rootTag;
					}
					normalizedRootTags.push(rootTagId);
				}
				const normalizedRoot = {
					...entry.root,
					tags: normalizedRootTags,
					// TODO We do NOT support double nested root creation
					root: entry.root.root as UUID,
				};
				rootId = dispatch(addWordToDictionary(normalizedRoot));
			} else {
				rootId = entry.root;
			}
			const normalizedTags = new Array<UUID>();
			for (const tag of entry.tags) {
				let tagId: UUID;
				if (typeof tag === 'object') {
					tagId = dispatch(createTag(tag));
				} else {
					tagId = tag;
				}
				normalizedTags.push(tagId);
			}
			const normalizedWord = {
				...entry,
				tags: normalizedTags,
				root: rootId || undefined,
			};

			if (entry.id) {
				dispatch(
					updateEntry({
						id: entry.id,
						entryData: normalizedWord,
					})
				);
				resultId = entry.id;
			} else {
				resultId = dispatch(addWordToDictionary(normalizedWord));
			}
		}
		if (rootId && resultId) {
			return [resultId, rootId];
		}
		return resultId;
	};

export {
	saveEntryRemote,
	checkSelectedWordExists,
	removeEntry,
	removeTag,
	removeTagRemote,
	addWordToDictionary,
	setDictionaryEntryLink,
	saveOrUpdateEntryInput,
	removeEntryRemote,
	saveDictionary,
	saveTags,
	createTag,
	addTag,
	fetchDictionary,
	cacheDictionaryEntry,
	updateEntry,
	updateTag,
	fetchTags,
	changeEntry,
	resetDictionary,
};
