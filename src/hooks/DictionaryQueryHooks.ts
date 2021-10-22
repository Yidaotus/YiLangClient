import {
	IListDictionaryParams,
	IListDictionaryResult,
} from 'api/definitions/api';
import {
	addDictionaryEntry,
	getEntry,
	listDictionary,
	searchDictionary,
} from 'api/dictionary.service';
import {
	IDictionaryEntry,
	IDictionaryEntryResolved,
} from 'Document/Dictionary';
import { notUndefined } from 'Document/Utility';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useActiveLanguageConf } from './useActiveLanguageConf';
import { useTags } from './useTags';

const useDictionaryEntry = (
	id: string | null
): [boolean, IDictionaryEntry | null] => {
	const lang = useActiveLanguageConf();

	const { data, isLoading } = useQuery(
		['dictEntries', 'details', lang, id],
		() => (id && lang ? getEntry({ id, language: lang?.key }) : null),
		{
			enabled: !!lang && !!id,
			keepPreviousData: true,
			refetchOnWindowFocus: false,
		}
	);

	return [isLoading, data?.entry || null];
};

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

const defaultValue = {
	total: 0,
	entries: [],
};

const useDictionarySearch = (
	searchTerm: string
): [boolean, Array<IDictionaryEntry>] => {
	const activeLanguage = useActiveLanguageConf();
	if (!activeLanguage) {
		throw new Error('No language selected!');
	}

	const { data, isLoading } = useQuery(
		['dictEntries', 'search', searchTerm],
		() =>
			searchDictionary({
				key: searchTerm,
				lang: activeLanguage.key,
			}),
		{
			staleTime: 60000,
		}
	);

	return [isLoading, data || []];
};

const useDictionaryEntries = (
	paginationOptions: IListDictionaryParams | null
): [boolean, IListDictionaryResult] => {
	const activeLanguage = useActiveLanguageConf();
	const { data, isLoading } = useQuery(
		[
			'dictEntries',
			'list',
			paginationOptions?.limit,
			paginationOptions?.skip,
			paginationOptions?.filter,
			paginationOptions?.sortBy,
		],
		() =>
			paginationOptions && activeLanguage
				? listDictionary({
						sortBy: paginationOptions.sortBy,
						filter: paginationOptions.filter,
						skip: paginationOptions.skip,
						limit: paginationOptions.limit,
						excerptLength: 80,
						lang: activeLanguage?.key,
				  })
				: defaultValue,
		{
			enabled: !!paginationOptions,
			keepPreviousData: true,
			staleTime: 60000,
		}
	);

	return [isLoading, data || defaultValue];
};

const useAddDictionaryEntry = () => {
	const lang = useActiveLanguageConf();
	//		['dictEntries', 'details', lang, id],
	const queryClient = useQueryClient();

	return useMutation(
		(newEntry: Omit<IDictionaryEntry, 'id' | 'lang'>) => {
			if (!lang) {
				throw new Error('No Language selected!');
			}
			return addDictionaryEntry({ ...newEntry, lang: lang.key });
		},
		{
			onSuccess: (response) => {
				// ✅ refetch the comments list for our blog post
				queryClient.invalidateQueries(['dictEntries', 'list', lang]);
				queryClient.invalidateQueries([
					'dictEntries',
					'details',
					lang,
					response,
				]);
			},
		}
	);
};

export {
	useDictionaryEntries,
	useDictionaryEntry,
	useDictionaryEntryResolved,
	useAddDictionaryEntry,
	useDictionarySearch,
};
