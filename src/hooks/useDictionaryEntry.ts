import { cacheDictionaryEntry } from '@store/dictionary/actions';
import { IRootState } from '@store/index';
import { selectActiveLanguageConfig } from '@store/user/selectors';
import { getEntry } from 'api/dictionary.service';
import {
	IDictionaryEntry,
	IDictionaryEntryResolved,
} from 'Document/Dictionary';
import { notUndefined } from 'Document/Utility';
import { UUID } from 'Document/UUID';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export interface IUseDictionaryOptions {
	cache: boolean;
}
const useDictionaryEntry = (
	dictId: UUID | null,
	options?: IUseDictionaryOptions
): IDictionaryEntryResolved | null => {
	const dispatch = useDispatch();
	const [entry, setEntry] = useState<IDictionaryEntryResolved | null>(null);
	const cachedEntry = useSelector(
		(state: IRootState) => dictId && state.dictionary.entries[dictId]
	);
	const userTags = useSelector((state: IRootState) => state.dictionary.tags);
	const currentLanguage = useSelector(selectActiveLanguageConfig);
	const shouldCache = options?.cache || false;

	useEffect(() => {
		const fetch = async () => {
			if (!dictId || !currentLanguage) {
				return;
			}

			let fetchedEntry: IDictionaryEntry | null = null;
			if (cachedEntry) {
				fetchedEntry = cachedEntry;
			} else {
				const remoteEntry = await getEntry({
					id: dictId,
					language: currentLanguage.key,
				});
				if (remoteEntry) {
					fetchedEntry = remoteEntry.entry;
					if (shouldCache) {
						dispatch(cacheDictionaryEntry(remoteEntry.entry));
					}
				}
			}

			if (fetchedEntry) {
				setEntry({
					...fetchedEntry,
					tags: fetchedEntry.tags
						.map((tagId) => userTags[tagId])
						.filter(notUndefined),
				});
			}
		};

		fetch();
	}, [cachedEntry, currentLanguage, dictId, dispatch, shouldCache, userTags]);

	return entry;
};

export default useDictionaryEntry;
