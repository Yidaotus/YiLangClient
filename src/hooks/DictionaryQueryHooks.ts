import handleError from '@helpers/Error';
import { queryKeyFactory } from '@helpers/queryHelper';
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

const dictSentencesKeys = queryKeyFactory('sentences');
const dictEntryKeys = queryKeyFactory('entries');

const useDictionarySentence = (
	sentenceId: string | undefined
): [boolean, IDictionarySentence | null] => {
	const activeLanguage = useActiveLanguageConf();
	const { data, isLoading } = useQuery(
		dictSentencesKeys(activeLanguage?.id).list(sentenceId),
		() => {
			if (!sentenceId || !activeLanguage) {
				throw new Error('no sentence / language selected!');
			}
			return getSentence({ sentenceId, language: activeLanguage.id });
		},
		{
			enabled: !!sentenceId && !!activeLanguage,
			refetchOnWindowFocus: false,
		}
	);

	return [isLoading, data || null];
};

const useDictionarySentencesByWord = (
	wordId: string | undefined
): [boolean, Array<IDictionarySentence>] => {
	const activeLanguage = useActiveLanguageConf();
	const { data, isLoading } = useQuery(
		dictSentencesKeys(activeLanguage?.id).by('Word', wordId),
		() => {
			if (!wordId || !activeLanguage) {
				throw new Error('no id / language selected!');
			}
			return getSentencesByWord({ wordId, language: activeLanguage.id });
		},
		{
			enabled: !!wordId && !!activeLanguage,
			refetchOnWindowFocus: false,
		}
	);

	return [isLoading, data || []];
};

const useDictionaryEntry = (
	id: string | undefined
): [boolean, IDictionaryEntry | null] => {
	const activeLanguage = useActiveLanguageConf();
	const { data, isLoading } = useQuery(
		dictEntryKeys(activeLanguage?.id).detail(id),
		() => {
			if (!id || !activeLanguage) {
				throw new Error('no id / language selected!');
			}
			return getEntry({ id, language: activeLanguage.id });
		},
		{
			enabled: !!id && !!activeLanguage,
			keepPreviousData: true,
			refetchOnWindowFocus: false,
		}
	);

	return [isLoading, data || null];
};

const useDictionaryEntryResolved = (
	id: string | undefined
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
	searchTerm: string | undefined
): [boolean, Array<IDictionaryEntry>] => {
	const activeLanguage = useActiveLanguageConf();

	const { data, isLoading } = useQuery(
		dictEntryKeys(activeLanguage?.id).list(searchTerm),
		() => {
			if (!activeLanguage || !searchTerm) {
				throw new Error('No language / searchterm selected!');
			}
			return searchDictionary({
				key: searchTerm || '',
				lang: activeLanguage.id,
			});
		},
		{
			staleTime: 60000,
			enabled: !!searchTerm && !!activeLanguage,
		}
	);

	return [isLoading, data || []];
};

const useDictionaryEntries = (
	paginationOptions: Omit<IListDictionaryParams, 'lang'> | undefined
): [boolean, IListDictionaryResult] => {
	const activeLanguage = useActiveLanguageConf();
	const { data, isLoading } = useQuery(
		dictEntryKeys(activeLanguage?.id).list({
			limit: paginationOptions?.limit,
			skip: paginationOptions?.skip,
			filter: paginationOptions?.filter,
			sortBy: paginationOptions?.sortBy,
		}),
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
			enabled: !!paginationOptions && !!activeLanguage,
			keepPreviousData: true,
			staleTime: 60000,
		}
	);

	return [isLoading, data || defaultValue];
};
const useDeleteDictionaryEntry = () => {
	const activeLanugage = useActiveLanguageConf();
	const queryClient = useQueryClient();

	return useMutation(
		(id: string) => {
			if (!activeLanugage) {
				throw new Error('No Language selected!');
			}
			return deleteDictionaryEntry(id, activeLanugage.id);
		},
		{
			onSuccess: (_, id) => {
				queryClient.invalidateQueries(
					dictEntryKeys(activeLanugage?.id).lists()
				);
				queryClient.invalidateQueries(
					dictEntryKeys(activeLanugage?.id).detail(id)
				);
			},
			onError: (response: IApiResponse<void>) => {
				handleError(response);
			},
		}
	);
};

const useUpdateDictionaryEntry = () => {
	const activeLanugage = useActiveLanguageConf();
	const queryClient = useQueryClient();

	return useMutation(
		(entryToUpdate: IDictionaryEntry) => {
			if (!activeLanugage) {
				throw new Error('No Language selected!');
			}
			return updateDictionaryEntry(
				{
					...entryToUpdate,
				},
				activeLanugage.id
			);
		},
		{
			onSuccess: (_, { id }) => {
				queryClient.invalidateQueries(
					dictEntryKeys(activeLanugage?.id).lists()
				);
				queryClient.invalidateQueries(
					dictEntryKeys(activeLanugage?.id).detail(id)
				);
			},
			onError: (response: IApiResponse<void>) => {
				handleError(response);
			},
		}
	);
};

const useAddDictionarySentence = () => {
	const activeLanugage = useActiveLanguageConf();
	//		['dictEntries', 'details', lang, id],
	const queryClient = useQueryClient();

	return useMutation(
		(newSentence: Omit<IDictionarySentence, 'id' | 'lang'>) => {
			if (!activeLanugage) {
				throw new Error('No Language selected!');
			}
			return addDictionarySentence(newSentence, activeLanugage.id);
		},
		{
			onSuccess: () => {
				queryClient.invalidateQueries(
					dictSentencesKeys(activeLanugage?.id).lists()
				);
			},
			onError: (response: IApiResponse<void>) => {
				handleError(response);
			},
		}
	);
};

const useUnlinkWordSentence = () => {
	const activeLanugage = useActiveLanguageConf();
	const queryClient = useQueryClient();

	return useMutation(
		(newLink: ILinkSentenceWordParams) => {
			if (!activeLanugage) {
				throw new Error('No Language selected!');
			}
			return unlinkSentenceWord(newLink, activeLanugage.id);
		},
		{
			onSuccess: () => {},
			onError: (response: IApiResponse<void>) => {
				handleError(response);
			},
		}
	);
};

const useLinkWordSentence = () => {
	const activeLanugage = useActiveLanguageConf();

	return useMutation(
		(newLink: ILinkSentenceWordParams) => {
			if (!activeLanugage) {
				throw new Error('No Language selected!');
			}
			return linkSentenceWord(newLink, activeLanugage.id);
		},
		{
			onSuccess: () => {},
			onError: (response: IApiResponse<void>) => {
				handleError(response);
			},
		}
	);
};

const useAddDictionaryEntry = () => {
	const activeLanugage = useActiveLanguageConf();
	//		['dictEntries', 'details', lang, id],
	const queryClient = useQueryClient();

	return useMutation(
		(newEntry: Omit<IDictionaryEntry, 'id' | 'lang'>) => {
			if (!activeLanugage) {
				throw new Error('No Language selected!');
			}
			return addDictionaryEntry(newEntry, activeLanugage.id);
		},
		{
			onSuccess: () => {
				queryClient.invalidateQueries(
					dictEntryKeys(activeLanugage?.id).lists()
				);
				queryClient.invalidateQueries(['dictEntries', 'search']);
			},
			onError: (response: IApiResponse<void>) => {
				handleError(response);
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
