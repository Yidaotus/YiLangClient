import { IEntryFormFields } from '@components/DictionaryEntry/EntryForm/EntryForm';
import { selectActiveLanguage } from '@store/user/selectors';
import { applyDictionaryDelta } from 'api/dictionary.service';
import { applyTagsDelta, getTags } from 'api/tags.service';
import { IDictionaryEntry, IDictionaryTag } from 'Document/Dictionary';
import { notUndefined } from 'Document/Utility';
import { getUUID, UUID } from 'Document/UUID';
import { StoreAction } from 'store';
import { DictionaryMutation } from './types';

type DictionaryAction<R = void> = StoreAction<DictionaryMutation, R>;

const updateEntry =
	({
		id,
		entryData,
	}: {
		id: UUID;
		entryData: Omit<IDictionaryEntry, 'id'>;
	}): DictionaryAction =>
	(dispatch) => {
		dispatch({
			type: 'DICTIONARY_SET_ENTRY',
			payload: {
				id,
				entry: { ...entryData, dirty: 'UPDATED' },
			},
		});
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
				type: 'DICTIONARY_SET_TAG',
				payload: {
					id,
					tag: {
						...currentTag,
						...tagData,
						dirty: 'UPDATED',
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
			type: 'DICTIONARY_SET_TAG',
			payload: {
				id: tagId,
				tag: { ...tag, id: tagId, dirty: 'NEW' },
			},
		});
		return tagId;
	};

const cacheTag =
	(tag: IDictionaryTag): DictionaryAction =>
	(dispatch) => {
		dispatch({
			type: 'DICTIONARY_SET_TAG',
			payload: {
				id: tag.id,
				tag: { ...tag, dirty: null },
			},
		});
	};

const fetchTags =
	(lang: string): DictionaryAction<Promise<void>> =>
	async (dispatch) => {
		const tags = (await getTags(lang)) || [];
		for (const tag of tags) {
			dispatch(cacheTag(tag));
		}
	};

const resetDictionary = (): DictionaryAction => (dispatch) => {
	dispatch({ type: 'DICTIONARY_RESET', payload: null });
};

const saveTags =
	(): DictionaryAction<Promise<void>> => async (dispatch, getState) => {
		const { tags } = getState().dictionary;

		const dirtyTags = Object.values(tags)
			.filter(notUndefined)
			.filter((tag) => !!tag.dirty);

		const updatedTags = dirtyTags.filter((tag) => tag.dirty === 'UPDATED');
		const newTags = dirtyTags.filter((tag) => tag.dirty === 'NEW');
		const deletedTags = dirtyTags.filter((tag) => tag.dirty === 'DELETED');

		// TODO: Use appropriate REST resource
		await applyTagsDelta({
			removedTags: [...deletedTags.map((tag) => tag.id)],
			updatedTags,
			addedTags: newTags,
		});

		for (const tag of dirtyTags) {
			dispatch({
				type: 'DICTIONARY_SET_TAG',
				payload: { id: tag.id, tag: { ...tag, dirty: null } },
			});
		}
	};

const saveDictionary =
	(): DictionaryAction<Promise<void>> => async (dispatch, getState) => {
		const { entries } = getState().dictionary;

		const dirtyEntries = Object.values(entries)
			.filter(notUndefined)
			.filter((tag) => !!tag.dirty);

		const updatedEntries = dirtyEntries.filter(
			(entry) => entry.dirty === 'UPDATED'
		);
		const newEntries = dirtyEntries.filter(
			(entry) => entry.dirty === 'NEW'
		);
		const deletedEntries = dirtyEntries.filter(
			(entry) => entry.dirty === 'DELETED'
		);

		// TODO: Use appropriate REST resource
		await applyDictionaryDelta({
			removedEntries: [...deletedEntries.map((tag) => tag.id)],
			updatedEntries,
			addedEntries: newEntries,
		});

		for (const entry of deletedEntries) {
			dispatch({
				type: 'DICTIONARY_REMOVE_ENTRY',
				payload: { id: entry.id },
			});
		}
		for (const entry of [...newEntries, ...updatedEntries]) {
			dispatch({
				type: 'DICTIONARY_SET_ENTRY',
				payload: { id: entry.id, entry: { ...entry, dirty: null } },
			});
		}
	};

const cacheDictionaryEntry =
	(entry: IDictionaryEntry): DictionaryAction =>
	(dispatch, getState) => {
		const { entries } = getState().dictionary;
		if (!entries[entry.id]) {
			dispatch({
				type: 'DICTIONARY_SET_ENTRY',
				payload: { id: entry.id, entry: { ...entry, dirty: null } },
			});
		}
	};

const addWordToDictionary =
	(word: Omit<IDictionaryEntry, 'id'>): DictionaryAction<UUID | null> =>
	(dispatch, getState): UUID => {
		const activeLanguage = selectActiveLanguage(getState().user);
		if (!activeLanguage) {
			throw Error('No Language selected!');
		}
		const dictEntryId = getUUID();
		const dictEntry = {
			...word,
			lang: activeLanguage.key,
			createdAt: new Date(),
		};
		dispatch({
			type: 'DICTIONARY_SET_ENTRY',
			payload: {
				id: dictEntryId,
				entry: { ...dictEntry, dirty: 'NEW' },
			},
		});
		return dictEntryId;
	};

/*
const setDictionaryEntryLink =
({ id, link }: { id: UUID; link: IDocumentLink }): DictionaryAction =>
(dispatch) => {
	dispatch({ type: 'DICTIONARY_SET_LINK', payload: { id, link } });
};
*/

const removeEntry =
	(id: UUID): DictionaryAction =>
	(dispatch, getState) => {
		const { entries } = getState().dictionary;
		const entryToDelete = entries[id];
		if (entryToDelete) {
			dispatch({
				type: 'DICTIONARY_SET_ENTRY',
				payload: { id, entry: { ...entryToDelete, dirty: 'DELETED' } },
			});
		}
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
	(dispatch, getState) => {
		const { tags } = getState().dictionary;
		const tagToDelete = tags[id];
		if (tagToDelete) {
			dispatch({
				type: 'DICTIONARY_SET_TAG',
				payload: { id, tag: { ...tagToDelete, dirty: 'DELETED' } },
			});
		}
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

const saveEntry =
	(
		entry: IDictionaryEntryInput,
		update = false
	): DictionaryAction<Promise<void>> =>
	async (dispatch, getState) => {
		const activeLanguage = selectActiveLanguage(getState().user);
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
	saveEntry,
	removeEntry,
	removeTag,
	removeTagRemote,
	addWordToDictionary,
	saveOrUpdateEntryInput,
	removeEntryRemote,
	saveDictionary,
	saveTags,
	createTag,
	cacheDictionaryEntry,
	updateEntry,
	cacheTag,
	updateTag,
	fetchTags,
	resetDictionary,
};
