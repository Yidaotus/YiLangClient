import {
	IDictionaryEntry,
	IDictionaryTag,
	IDocumentLink,
} from 'Document/Dictionary';
import { UUID } from 'Document/UUID';
import { DirtyObject, StoreMutation } from 'store';

export interface IDictionaryState {
	entries: Partial<{ [key: string]: DirtyObject<IDictionaryEntry> }>;
	tags: Partial<{ [key: string]: DirtyObject<IDictionaryTag> }>;
}

export type DictionaryMutations = DictionaryMutation['type'];

type DictionaryMutationType<T extends string, P = null> = StoreMutation<
	'DICTIONARY',
	T,
	P
>;

export type DictionaryMutation =
	| DictionaryMutationType<'RESET'>
	| DictionaryMutationType<'SET_STATE', { dictionary: IDictionaryState }>
	| DictionaryMutationType<'CACHE_ENTRY', { entry: IDictionaryEntry }>
	| DictionaryMutationType<'CACHE_TAG', { tag: IDictionaryTag }>
	| DictionaryMutationType<'INITIALIZE', { entries: Array<IDictionaryEntry> }>
	| DictionaryMutationType<
			'UPDATE_TAG',
			{ id: UUID; tag: Omit<IDictionaryTag, 'id'> }
	  >
	| DictionaryMutationType<
			'UPDATE_ENTRY',
			{ id: UUID; entry: Omit<IDictionaryEntry, 'id'> }
	  >
	| DictionaryMutationType<'REMOVE_ENTRY', { id: UUID }>
	| DictionaryMutationType<'REMOVE_TAG', { id: UUID }>
	| DictionaryMutationType<'ADD_ENTRY', { entry: IDictionaryEntry }>
	| DictionaryMutationType<'ADD_TAG', { tag: IDictionaryTag }>
	| DictionaryMutationType<'CLEAN_ENTRY', { id: UUID }>
	| DictionaryMutationType<'CLEAN_TAG', { id: UUID }>
	| DictionaryMutationType<'SET_LINK', { id: UUID; link: IDocumentLink }>;
