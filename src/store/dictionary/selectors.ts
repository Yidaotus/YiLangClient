import { createSelector } from 'reselect';
import { IRootState } from 'store';

const selectAddedDictionaryEntries = createSelector(
	(state: IRootState) => state.dictionary.entries,
	(entries) => {
		return Object.values(entries).map(
			(entry) => entry && entry.dirty === 'NEW'
		);
	}
);

export default { selectAddedDictionaryEntries };
