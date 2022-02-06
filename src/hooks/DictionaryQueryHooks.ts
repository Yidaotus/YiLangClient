import useUiErrorHandler from '@helpers/useUiErrorHandler';
import { queryKeyFactory } from '@helpers/queryHelper';
import {
	IAddDictionarySentenceParams,
	IApiResponse,
	ILinkSentenceWordParams,
	IListDictionaryParams,
	IListDictionaryResult,
	IListSentencesParams,
	IListSentencesResult,
} from 'api/definitions/api';
import {
	addDictionaryEntry,
	addDictionarySentence,
	deleteDictionaryEntry,
	getEntry,
	getSentence,
	getSentencesByWord,
	linkSentenceWord,
	listSentences,
	listDictionary,
	searchDictionary,
	unlinkSentenceWord,
	updateDictionaryEntry,
	updateDictionarySentence,
} from 'api/dictionary.service';
import {
	IDictionaryEntry,
	IDictionaryEntryResolved,
	IDictionarySentence,
} from 'Document/Dictionary';
import {
	DictionaryEntryID,
	DictionarySentenceID,
	notUndefined,
} from 'Document/Utility';
import {
	QueryFunction,
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

const sentenceQueryFactory = (
	sentenceId: DictionarySentenceID | undefined,
	activeLanguageId: string | undefined
) => {
	const queryFunction: QueryFunction<IDictionarySentence> = () => {
		if (!sentenceId || !activeLanguageId) {
			throw new Error('no sentence / language selected!');
		}
		return getSentence({ sentenceId, language: activeLanguageId });
	};
	return queryFunction;
};

const useDictionarySentence = (
	sentenceId: DictionarySentenceID | undefined
): [boolean, IDictionarySentence | null] => {
	const activeLanguage = useActiveLanguageConf();
	const { data, isLoading } = useQuery(
		dictSentencesKeys(activeLanguage?.id).detail(sentenceId),
		sentenceQueryFactory(sentenceId, activeLanguage?.id),
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

const entryQueryFactory = (
	entryId: DictionarySentenceID | undefined,
	activeLanguageId: string | undefined
) => {
	const queryFunction: QueryFunction<IDictionaryEntry> = () => {
		if (!entryId || !activeLanguageId) {
			throw new Error('no entry / language selected!');
		}
		return getEntry({ id: entryId, language: activeLanguageId });
	};
	return queryFunction;
};

const useDictionaryEntry = (
	id: string | undefined
): [boolean, IDictionaryEntry | null] => {
	const activeLanguage = useActiveLanguageConf();
	const { data, isLoading } = useQuery(
		dictEntryKeys(activeLanguage?.id).detail(id),
		entryQueryFactory(id, activeLanguage?.id),
		{
			enabled: !!id && !!activeLanguage,
			keepPreviousData: false,
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

const DEFAULT_LIST_ENTRIES = {
	total: 0,
	entries: [],
};

const DEFAULT_LIST_SENTENCES = {
	total: 0,
	sentences: [],
};

const useDictionarySearch = (
	searchTerm: string | undefined
): [boolean, Array<IDictionaryEntry> | undefined] => {
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

	return [isLoading, data];
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
			searchTerm: paginationOptions?.searchTerm,
			tagFilter: paginationOptions?.tagFilter,
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
						searchTerm: paginationOptions.searchTerm,
						tagFilter: paginationOptions.tagFilter || [],
				  })
				: DEFAULT_LIST_ENTRIES,
		{
			enabled: !!paginationOptions && !!activeLanguage,
			keepPreviousData: true,
			staleTime: 60000,
		}
	);

	return [isLoading, data || DEFAULT_LIST_ENTRIES];
};
const useDeleteDictionaryEntry = (): UseMutationResult<
	void,
	IApiResponse<void>,
	string,
	unknown
> => {
	const activeLanugage = useActiveLanguageConf();
	const queryClient = useQueryClient();
	const handleError = useUiErrorHandler();

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
	const handleError = useUiErrorHandler();

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

const useListDictionarySentences = (
	paginationOptions: Omit<IListSentencesParams, 'lang'> | undefined
): [boolean, IListSentencesResult] => {
	const activeLanguage = useActiveLanguageConf();
	const { data, isLoading } = useQuery(
		dictSentencesKeys(activeLanguage?.id).list({
			limit: paginationOptions?.limit,
			skip: paginationOptions?.skip,
			filter: paginationOptions?.filter,
			sortBy: paginationOptions?.sortBy,
			searchTerm: paginationOptions?.searchTerm,
		}),
		() =>
			paginationOptions && activeLanguage
				? listSentences({
						sortBy: paginationOptions.sortBy,
						filter: paginationOptions.filter,
						skip: paginationOptions.skip,
						limit: paginationOptions.limit,
						lang: activeLanguage.id,
						searchTerm: paginationOptions.searchTerm,
				  })
				: DEFAULT_LIST_SENTENCES,
		{
			enabled: !!paginationOptions && !!activeLanguage,
			keepPreviousData: true,
			staleTime: 60000,
		}
	);

	return [isLoading, data || DEFAULT_LIST_SENTENCES];
};

const useAddDictionarySentence = (): UseMutationResult<
	string,
	IApiResponse<void>,
	IAddDictionarySentenceParams,
	unknown
> => {
	const activeLanugage = useActiveLanguageConf();
	const queryClient = useQueryClient();
	const handleError = useUiErrorHandler();

	return useMutation(
		(newSentence: IAddDictionarySentenceParams) => {
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

const useUpdateDictionarySentence = (): UseMutationResult<
	void,
	IApiResponse<void>,
	IDictionarySentence,
	unknown
> => {
	const activeLanugage = useActiveLanguageConf();
	const queryClient = useQueryClient();
	const handleError = useUiErrorHandler();

	return useMutation(
		(entryToUpdate: IDictionarySentence) => {
			if (!activeLanugage) {
				throw new Error('No Language selected!');
			}
			return updateDictionarySentence(entryToUpdate, activeLanugage.id);
		},
		{
			onSuccess: (_, { id }) => {
				queryClient.invalidateQueries(
					dictSentencesKeys(activeLanugage?.id).lists()
				);
				queryClient.invalidateQueries(
					dictSentencesKeys(activeLanugage?.id).detail(id)
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
	const handleError = useUiErrorHandler();

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
	const handleError = useUiErrorHandler();

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
	const handleError = useUiErrorHandler();

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
	useListDictionarySentences,
	useDictionaryEntry,
	useAddDictionaryEntry,
	useDeleteDictionaryEntry,
	useUpdateDictionaryEntry,
	useUpdateDictionarySentence,
	useDictionarySearch,
	useAddDictionarySentence,
	useLinkWordSentence,
	useUnlinkWordSentence,
	useDictionarySentencesByWord,
	useDictionarySentence,
	useDictionaryEntryResolved,
	sentenceQueryFactory,
	entryQueryFactory,
};
