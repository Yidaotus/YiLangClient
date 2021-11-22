import handleError from '@helpers/Error';
import {
	IApiResponse,
	ILinkSentenceWordParams,
	IListDictionaryParams,
	IListDictionaryResult,
} from 'api/definitions/api';
import {
	addDictionaryEntry,
	addDictionarySentence,
	deleteDictionaryEntry,
	getEntry,
	getSentence,
	getSentencesByWord,
	linkSentenceWord,
	listDictionary,
	searchDictionary,
	unlinkSentenceWord,
	updateDictionaryEntry,
} from 'api/dictionary.service';
import {
	IDictionaryEntry,
	IDictionaryEntryResolved,
	IDictionarySentence,
} from 'Document/Dictionary';
import { notUndefined } from 'Document/Utility';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useActiveLanguageConf } from './ConfigQueryHooks';
import { useTags } from './useTags';

const useDictionarySentence = (
	sentenceId: string | null
): [boolean, IDictionarySentence | null] => {
	const activeLanguage = useActiveLanguageConf();
	const { data, isLoading } = useQuery(
		['sentences', 'byWord', activeLanguage?.id, sentenceId],
		() => {
			return sentenceId && activeLanguage
				? getSentence({ sentenceId, language: activeLanguage.id })
				: null;
		},
		{
			enabled: !!sentenceId,
			refetchOnWindowFocus: false,
		}
	);

	return [isLoading, data || null];
};

const useDictionarySentencesByWord = (
	wordId: string | null
): [boolean, Array<IDictionarySentence>] => {
	const activeLanguage = useActiveLanguageConf();
	const { data, isLoading } = useQuery(
		['sentences', 'byWord', activeLanguage?.id, wordId],
		() => {
			return wordId && activeLanguage
				? getSentencesByWord({ wordId, language: activeLanguage.id })
				: null;
		},
		{
			enabled: !!wordId,
			refetchOnWindowFocus: false,
		}
	);

	return [isLoading, data || []];
};

const useDictionaryEntry = (
	id: string | null
): [boolean, IDictionaryEntry | null] => {
	const activeLanguage = useActiveLanguageConf();
	const { data, isLoading } = useQuery(
		['dictEntries', 'details', activeLanguage?.id, id],
		() => {
			return id && activeLanguage
				? getEntry({ id, language: activeLanguage.id })
				: null;
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
				lang: activeLanguage.id,
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
	paginationOptions: Omit<IListDictionaryParams, 'lang'> | null
): [boolean, IListDictionaryResult] => {
	const activeLanguage = useActiveLanguageConf();
	const { data, isLoading } = useQuery(
		[
			'dictEntries',
			'list',
			activeLanguage?.id,
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
						lang: activeLanguage.id,
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
const useDeleteDictionaryEntry = () => {
	const lang = useActiveLanguageConf();
	const queryClient = useQueryClient();

	return useMutation(
		(id: string) => {
			if (!lang) {
				throw new Error('No Language selected!');
			}
			return deleteDictionaryEntry(id, lang.id);
		},
		{
			onSuccess: (_, id) => {
				// ✅ refetch the comments list for our blog post
				queryClient.invalidateQueries(['dictEntries', 'list', lang]);
				queryClient.invalidateQueries([
					'dictEntries',
					'details',
					lang?.id,
					id,
				]);
			},
			onError: (response: IApiResponse<void>) => {
				handleError(response.message);
			},
		}
	);
};

const useUpdateDictionaryEntry = () => {
	const lang = useActiveLanguageConf();
	//		['dictEntries', 'details', lang, id],
	const queryClient = useQueryClient();

	return useMutation(
		(entryToUpdate: IDictionaryEntry) => {
			if (!lang) {
				throw new Error('No Language selected!');
			}
			return updateDictionaryEntry(
				{
					...entryToUpdate,
				},
				lang.id
			);
		},
		{
			onSuccess: (_, entry) => {
				// ✅ refetch the comments list for our blog post
				queryClient.invalidateQueries([
					'dictEntries',
					'list',
					lang?.id,
				]);
				queryClient.invalidateQueries([
					'dictEntries',
					'details',
					lang?.id,
					entry.id,
				]);
			},
			onError: (response: IApiResponse<void>) => {
				handleError(response.message);
			},
		}
	);
};

const useAddDictionarySentence = () => {
	const lang = useActiveLanguageConf();
	//		['dictEntries', 'details', lang, id],
	const queryClient = useQueryClient();

	return useMutation(
		(newSentence: Omit<IDictionarySentence, 'id' | 'lang'>) => {
			if (!lang) {
				throw new Error('No Language selected!');
			}
			return addDictionarySentence(newSentence, lang.id);
		},
		{
			onSuccess: (response) => {
				queryClient.invalidateQueries(['sentences']);
			},
			onError: (response: IApiResponse<void>) => {
				handleError(response.message);
			},
		}
	);
};

const useUnlinkWordSentence = () => {
	const lang = useActiveLanguageConf();
	const queryClient = useQueryClient();

	return useMutation(
		(newLink: ILinkSentenceWordParams) => {
			if (!lang) {
				throw new Error('No Language selected!');
			}
			return unlinkSentenceWord(newLink, lang.id);
		},
		{
			onSuccess: (response) => {
				queryClient.invalidateQueries(['sentences']);
			},
			onError: (response: IApiResponse<void>) => {
				handleError(response.message);
			},
		}
	);
};

const useLinkWordSentence = () => {
	const lang = useActiveLanguageConf();
	const queryClient = useQueryClient();

	return useMutation(
		(newLink: ILinkSentenceWordParams) => {
			if (!lang) {
				throw new Error('No Language selected!');
			}
			return linkSentenceWord(newLink, lang.id);
		},
		{
			onSuccess: (response) => {
				queryClient.invalidateQueries(['sentences']);
			},
			onError: (response: IApiResponse<void>) => {
				handleError(response.message);
			},
		}
	);
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
			return addDictionaryEntry(newEntry, lang.id);
		},
		{
			onSuccess: (response) => {
				// ✅ refetch the comments list for our blog post
				queryClient.invalidateQueries([
					'dictEntries',
					'list',
					lang?.id,
				]);
				queryClient.invalidateQueries([
					'dictEntries',
					'details',
					lang?.id,
					response,
				]);
				queryClient.invalidateQueries(['dictEntries', 'search']);
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
	useDeleteDictionaryEntry,
	useUpdateDictionaryEntry,
	useDictionarySearch,
	useAddDictionarySentence,
	useLinkWordSentence,
	useUnlinkWordSentence,
	useDictionarySentencesByWord,
	useDictionarySentence,
};
