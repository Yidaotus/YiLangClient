import handleError from '@helpers/Error';
import { IRootState } from '@store/index';
import { selectActiveLanguageConfig } from '@store/user/selectors';
import { searchDictionary } from 'api/dictionary.service';
import {
	IDictionaryEntry,
	IDictionaryEntryResolved,
} from 'Document/Dictionary';
import { notUndefined } from 'Document/Utility';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

const useSearchDictionary = (
	searchTerm: string | null
): [boolean, Array<IDictionaryEntryResolved>] => {
	const [loading, setLoading] = useState(false);
	const [entries, setEntries] = useState<Array<IDictionaryEntryResolved>>([]);
	const selectedLanguage = useSelector(selectActiveLanguageConfig);
	const localDictionary = useSelector(
		(state: IRootState) => state.dictionary.entries
	);
	const userTags = useSelector((state: IRootState) => state.dictionary.tags);

	useEffect(() => {
		const search = async () => {
			if (!searchTerm) {
				return;
			}

			setLoading(true);
			try {
				if (!selectedLanguage) {
					throw new Error('No language selected!');
				}
				const cachHitEntries = Object.values(
					localDictionary || {}
				).filter((entry) => {
					return (
						entry &&
						entry.key
							.toLowerCase()
							.includes(searchTerm.toLowerCase())
					);
				});
				let foundEntries: Array<IDictionaryEntry> = [];
				if (cachHitEntries && cachHitEntries.length > 0) {
					foundEntries = cachHitEntries.filter(notUndefined);
				}

				const serverEntries = await searchDictionary({
					lang: selectedLanguage.key,
					key: searchTerm,
				});
				if (serverEntries) {
					foundEntries = [
						...foundEntries,
						...serverEntries.filter(notUndefined),
					];
				}
				if (foundEntries) {
					setEntries(
						foundEntries.map((foundEntry) => ({
							...foundEntry,
							tags: foundEntry.tags
								.map((tagId) => userTags[tagId])
								.filter(notUndefined),
						}))
					);
				}
			} catch (e) {
				handleError(e);
			}
			setLoading(false);
		};

		search();
	}, [localDictionary, searchTerm, selectedLanguage, userTags]);

	return [loading, entries];
};

export default useSearchDictionary;
