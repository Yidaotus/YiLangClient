import { selectActiveFragmentLayer } from '@store/editor/selectors';
import { IDictionaryEntry } from 'Document/Dictionary';
import { notUndefined } from 'Document/Utility';
import { UUID } from 'Document/UUID';
import { createSelector } from 'reselect';
import { IRootState, StoreMap } from 'store';

const selectAddedDictionaryEntries = createSelector(
	(state: IRootState) => state.dictionary.dictionary,
	(state: IRootState) => state.dictionary.addedEntries,
	(dicionary, addedEntries) => {
		const resolvedEntries: StoreMap<IDictionaryEntry> = {};
		for (const entryId of addedEntries) {
			const entry = dicionary[entryId];
			if (entry) {
				resolvedEntries[entryId] = entry;
			}
		}
		return resolvedEntries;
	}
);

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const selectDictionaryEntries = () =>
	createSelector(
		(state: IRootState) => state.dictionary.dictionary,
		(_: unknown, ids: Array<string>) => ids,
		(dictionary, ids) => {
			const foundFragments = ids
				.map((id) => dictionary[id])
				.filter((entry) => !!entry)
				.filter(notUndefined);
			return foundFragments;
		}
	);

const selectUserTags = createSelector(
	(state: IRootState) => state.dictionary.tags,
	(tags) => {
		return Object.values(tags).filter(notUndefined);
	}
);

const selectFragmentables = (state: IRootState) => state.editor.fragmentables;

const selectFragmentablesById = () =>
	createSelector(
		[
			selectFragmentables,
			(_: IRootState, fragmentableIds: Array<UUID>) => fragmentableIds,
		],
		(fragmentables, fragmentableIds) =>
			fragmentableIds.map((id) => fragmentables[id])
	);

const selectFragmentsById = () =>
	createSelector(
		[
			selectActiveFragmentLayer,
			(_: unknown, fragmentIds: Array<UUID>) => fragmentIds,
		],
		(fragments, fragmentIds) => {
			if (fragments) {
				return fragmentIds
					.map((id) => fragments[id])
					.filter(notUndefined);
			}
			return [];
		}
	);

const selectBlockById = () =>
	createSelector(
		[
			(state: IRootState) => state.editor.document?.blocks,
			(_: IRootState, blockId: string) => blockId,
		],
		(blocks, blockId) => {
			if (blocks) {
				return blocks[blockId];
			}
			return null;
		}
	);

export {
	selectAddedDictionaryEntries,
	selectDictionaryEntries,
	selectUserTags,
	selectFragmentablesById,
	selectFragmentsById,
	selectBlockById,
};
