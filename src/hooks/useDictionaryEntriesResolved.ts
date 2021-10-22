import { IDictionaryEntryResolved } from 'Document/Dictionary';
import { notUndefined } from 'Document/Utility';
import useDictionaryEntry from './useDictionaryEntry';
import { useTags } from './useTags';

const useDictionaryEntryResolved = (
	id: string | null
): [boolean, IDictionaryEntryResolved | null] => {
	const [loading, entry] = useDictionaryEntry(id);
	const tags = useTags();

	let resolvedEntry: IDictionaryEntryResolved | null = null;
	if (entry) {
		resolvedEntry = {
			...entry,
			tags: entry.tags
				.map((tagId) => tags.find((tagEntry) => tagEntry.id === tagId))
				.filter(notUndefined),
		};
	}

	return [loading, resolvedEntry];
};

export default useDictionaryEntryResolved;
