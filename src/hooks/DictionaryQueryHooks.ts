import handleError from '@helpers/Error';
import {
	IApiResponse,
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
	const { data, isLoading } = useQuery(
		['dictEntries', 'details', id],
		() => {
			return id ? getEntry({ id }) : null;
		},
		{
			enabled: !!id,
			keepPreviousData: true,
			refetchOnWindowFocus: false,
		}
	);

	return [isLoading, data || null];
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
	searchTerm: string | null
): [boolean, Array<IDictionaryEntry>] => {
	const activeLanguage = useActiveLanguageConf();

	const { data, isLoading } = useQuery(
		['dictEntries', 'search', searchTerm],
		() => {
			if (!activeLanguage) {
				throw new Error('No language selected!');
			}

			return searchDictionary({
				key: searchTerm || '',
				lang: activeLanguage.key,
			});
		},
		{
			staleTime: 60000,
			enabled: !!searchTerm,
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
			onError: (response: IApiResponse<void>) => {
				handleError(response.message);
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
