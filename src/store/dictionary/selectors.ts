import { notUndefined } from 'Document/Utility';
import { createSelector } from 'reselect';
import { IRootState } from 'store';

const selectAddedDictionaryEntries = createSelector(
	(state: IRootState) => state.dictionary.entries,
	(state: IRootState) => state.dictionary.tags,
	(entries, tags) => {
		return Object.values(entries)
			.filter((entry) => entry && entry.dirty === 'NEW')
			.filter(notUndefined)
			.map((entry) => ({
				...entry,
				tags: entry.tags
					.map((tagId) => tags[tagId])
					.filter(notUndefined),
			}));
	}
);

// eslint-disable-next-line import/prefer-default-export
export { selectAddedDictionaryEntries };
