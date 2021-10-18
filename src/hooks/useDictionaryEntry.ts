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
import useDictionaryTags from './useDictionaryTags';

export interface IUseDictionaryOptions {
	cache: boolean;
}
const useDictionaryEntry = (
	dictId: UUID | null,
	options?: IUseDictionaryOptions
): IDictionaryEntryResolved | null => {
	const dispatch = useDispatch();
	const [entry, setEntry] = useState<IDictionaryEntryResolved | null>(null);
	const userDictionary = useSelector(
		(state: IRootState) => state.dictionary.entries
	);
	const userTags = useSelector((state: IRootState) => state.dictionary.tags);
	const currentLanguage = useSelector(selectActiveLanguageConfig);

	useEffect(() => {
		const fetch = async () => {
			if (!dictId || !currentLanguage) {
				return;
			}

			let fetchedEntry: IDictionaryEntry | null = null;
			const cachedEntry = userDictionary[dictId];
			if (cachedEntry) {
				fetchedEntry = cachedEntry;
			} else {
				const remoteEntry = await getEntry({
					id: dictId,
					language: currentLanguage.key,
				});
				if (remoteEntry) {
					fetchedEntry = remoteEntry.entry;
					if (options?.cache) {
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
	}, [currentLanguage, dictId, dispatch, options, userDictionary, userTags]);

	return entry;
};

export default useDictionaryEntry;
