import { IDictionaryEntry, IDictionaryTag } from 'Document/Dictionary';
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
	| DictionaryMutationType<'INITIALIZE', { entries: Array<IDictionaryEntry> }>
	| DictionaryMutationType<'REMOVE_ENTRY', { id: UUID }>
	| DictionaryMutationType<'REMOVE_TAG', { id: UUID }>
	| DictionaryMutationType<
			'SET_ENTRY',
			{ id: UUID; entry: DirtyObject<Omit<IDictionaryEntry, 'id'>> }
	  >
	| DictionaryMutationType<
			'SET_TAG',
			{ id: UUID; tag: DirtyObject<Omit<IDictionaryTag, 'id'>> }
	  >;
