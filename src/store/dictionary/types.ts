import { IDictionaryEntry, IDictionaryTag } from 'Document/Dictionary';
import { IDocumentLink } from 'Document/Document';
import { UUID } from 'Document/UUID';
import { StoreMap, StoreMutation } from 'store';

export interface IDictionaryState {
	dictionary: Partial<{ [key: string]: IDictionaryEntry }>;
	tags: Partial<{ [key: string]: IDictionaryTag }>;
	addedEntries: Array<UUID>;
	updatedEntries: Array<UUID>;
	removedEntries: Array<UUID>;
	updatedTags: Array<UUID>;
	removedTags: Array<UUID>;
	addedTags: Array<UUID>;
}

export type DictionaryMutations = DictionaryMutation['type'];

type DictionaryMutationType<T extends string, P = null> = StoreMutation<
	'DICTIONARY',
	T,
	P
>;

export type DictionaryMutation =
	| DictionaryMutationType<'RESET'>
	| DictionaryMutationType<'UPDATE_TAG', { id: UUID; tag: IDictionaryTag }>
	| DictionaryMutationType<'RESET_TAG_DELTA'>
	| DictionaryMutationType<'RESET_ENTRY_DELTA'>
	| DictionaryMutationType<'SET_TAGS', { tags: StoreMap<IDictionaryTag> }>
	| DictionaryMutationType<
			'SET_ENTRIES',
			{ entries: StoreMap<IDictionaryEntry> }
	  >
	| DictionaryMutationType<'SET_STATE', { dictionary: IDictionaryState }>
	| DictionaryMutationType<'CACHE_ENTRY', { entry: IDictionaryEntry }>
	| DictionaryMutationType<'ADD_ENTRY', { entry: IDictionaryEntry }>
	| DictionaryMutationType<
			'PUSH_ENTRIES',
			{ entries: Array<IDictionaryEntry> }
	  >
	| DictionaryMutationType<
			'CHANGE_ENTRY',
			{ id: UUID; entry: IDictionaryEntry }
	  >
	| DictionaryMutationType<'ADD_CHANGED_ENTRY', { id: UUID }>
	| DictionaryMutationType<
			'INITIALIZE',
			{ entries: Array<{ entryId: string } & IDictionaryEntry> }
	  >
	| DictionaryMutationType<'REMOVE_ENTRY', { id: UUID }>
	| DictionaryMutationType<'REMOVE_TAG', { id: UUID }>
	| DictionaryMutationType<'SET_LINK', { id: UUID; link: IDocumentLink }>
	| DictionaryMutationType<'ADD_TAG', { tag: IDictionaryTag }>;
