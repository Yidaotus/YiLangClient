import { IRootState } from '@store/index';
import { useDispatch, useSelector } from 'react-redux';
import { selectActiveLanguageConfig } from '@store/user/selectors';
import { UUID } from 'Document/UUID';
import { cacheDictionaryEntry } from '@store/dictionary/actions';
import {
	IDictionaryEntry,
	IDictionaryEntryResolved,
} from 'Document/Dictionary';
import { useCallback } from 'react';
import { notUndefined } from 'Document/Utility';
import { getEntry } from '../api/dictionary.service';

type IFetchFunction = (id: UUID) => Promise<IDictionaryEntryResolved | null>;

const useLazyDictionary = (): IFetchFunction => {
	const userDictionary = useSelector(
		(state: IRootState) => state.dictionary.dictionary
	);
	const userTags = useSelector((state: IRootState) => state.dictionary.tags);
	const currentLanguage = useSelector(selectActiveLanguageConfig);
	const dispatch = useDispatch();

	const fetchSingle = useCallback(
		async (id: UUID) => {
			if (!currentLanguage) {
				return null;
			}

			let entry: IDictionaryEntry | null = null;
			const cachedEntry = userDictionary[id];
			if (cachedEntry) {
				entry = cachedEntry;
			} else {
				const remoteEntry = await getEntry({
					id,
					language: currentLanguage.key,
				});
				if (remoteEntry) {
					entry = remoteEntry.entry;
					dispatch(cacheDictionaryEntry(entry));
				}
			}

			return entry;
		},
		[currentLanguage, dispatch, userDictionary]
	);

	const lazyFetch = useCallback(
		async (id: UUID) => {
			const entry = await fetchSingle(id);

			let resolvedEntry: IDictionaryEntryResolved | null = null;
			if (entry) {
				let root: IDictionaryEntryResolved | undefined;
				if (entry.root) {
					const rootEntry = await fetchSingle(entry.root);
					if (rootEntry) {
						const rootTags = rootEntry.tags
							.map((tagId) => userTags[tagId])
							.filter(notUndefined);

						root = {
							...rootEntry,
							tags: rootTags,
							root: undefined,
						};
					}
				}
				const wordTags = entry.tags
					.map((tagId) => userTags[tagId])
					.filter(notUndefined);

				resolvedEntry = {
					...entry,
					root,
					tags: wordTags,
				};
			}
			return resolvedEntry;
		},
		[fetchSingle, userTags]
	);

	return lazyFetch;
};

export default useLazyDictionary;
