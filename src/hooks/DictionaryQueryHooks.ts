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
import { getTag } from 'api/tags.service';
import {
	IDictionaryEntry,
	IDictionaryEntryResolved,
	IDictionarySentence,
	IDictionaryTag,
} from 'Document/Dictionary';
import {
	DictionaryEntryID,
	DictionaryTagID,
	notUndefined,
} from 'Document/Utility';
import {
	useMutation,
	UseMutationResult,
	useQueries,
	useQuery,
	useQueryClient,
	UseQueryResult,
} from 'react-query';
import { useActiveLanguageConf } from './ConfigQueryHooks';
import { useTags } from './useTags';

const dictSentencesKeys = queryKeyFactory('sentences');
const dictEntryKeys = queryKeyFactory('entries');
const tagEntryKeys = queryKeyFactory('tags');

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

const useDictionaryEntryFromArray = (entryIds: Array<DictionaryEntryID>) => {
	const activeLanguage = useActiveLanguageConf();
	const entryResults = useQueries(
		entryIds.map((entry) => ({
			queryKey: dictEntryKeys(activeLanguage?.id).detail(entry),
			queryFn: () => {
				if (!activeLanguage) {
					throw new Error('no id / language selected!');
				}
				return getEntry({ language: activeLanguage.id, id: entry });
			},
		}))
	) as Array<UseQueryResult<IDictionaryEntry>>;
	return entryResults.map(({ data }) => data).filter(notUndefined);
};

const useDictionaryEntryResolved = (
	id: string | undefined
): [boolean, IDictionaryEntryResolved | null] => {
	const [isLoading, unresolvedEntry] = useDictionaryEntry(id);

	const resolvedTags = useTags(unresolvedEntry?.tags || []);
	const resolvedRoots = useDictionaryEntryFromArray(
		unresolvedEntry?.roots || []
	);

	let resolvedEntry: IDictionaryEntryResolved | null = null;
	if (unresolvedEntry) {
		resolvedEntry = {
			...unresolvedEntry,
			tags: resolvedTags,
			roots: resolvedRoots,
		};
	}

	return [isLoading, resolvedEntry];
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

const useListDictionaryEntries = (
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
const useDeleteDictionaryEntry = (): UseMutationResult<
	void,
	IApiResponse<void>,
	string,
	unknown
> => {
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

const useUpdateDictionaryEntry = (): UseMutationResult<
	void,
	IApiResponse<void>,
	IDictionaryEntry,
	unknown
> => {
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

const useAddDictionarySentence = (): UseMutationResult<
	string,
	IApiResponse<void>,
	Omit<IDictionarySentence, 'id' | 'lang'>,
	unknown
> => {
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

const useUnlinkWordSentence = (): UseMutationResult<
	void,
	IApiResponse<void>,
	ILinkSentenceWordParams,
	unknown
> => {
	const activeLanugage = useActiveLanguageConf();

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

const useLinkWordSentence = (): UseMutationResult<
	void,
	IApiResponse<void>,
	ILinkSentenceWordParams,
	unknown
> => {
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

const useAddDictionaryEntry = (): UseMutationResult<
	DictionaryEntryID,
	IApiResponse<void>,
	Omit<IDictionaryEntry, 'id' | 'lang' | 'createdAt'>,
	unknown
> => {
	const activeLanugage = useActiveLanguageConf();
	//		['dictEntries', 'details', lang, id],
	const queryClient = useQueryClient();

	return useMutation(
		(newEntry: Omit<IDictionaryEntry, 'id' | 'lang' | 'createdAt'>) => {
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
	useListDictionaryEntries,
	useDictionaryEntry,
	useAddDictionaryEntry,
	useDeleteDictionaryEntry,
	useUpdateDictionaryEntry,
	useDictionarySearch,
	useAddDictionarySentence,
	useLinkWordSentence,
	useUnlinkWordSentence,
	useDictionarySentencesByWord,
	useDictionarySentence,
	useDictionaryEntryResolved,
};
