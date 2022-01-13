import { queryKeyFactory } from '@helpers/queryHelper';
import { addTag, getTag, getTags, searchTags } from 'api/tags.service';
import { IDictionaryTag } from 'Document/Dictionary';
import { DictionaryTagID, notUndefined } from 'Document/Utility';
import {
	useMutation,
	UseMutationResult,
	useQueries,
	useQuery,
	useQueryClient,
	UseQueryResult,
} from 'react-query';
import { useActiveLanguageConf } from './ConfigQueryHooks';

const tagEntryKeys = queryKeyFactory('tags');

const useDictionaryTag = (
	tagId: DictionaryTagID
): [boolean, IDictionaryTag | null] => {
	const activeLanguage = useActiveLanguageConf();

	const { data, isLoading } = useQuery(
		tagEntryKeys(activeLanguage?.id).detail(tagId),
		() => {
			if (!tagId || !activeLanguage) {
				throw new Error('no id / language selected!');
			}
			return getTag({ language: activeLanguage.id, tagId });
		},
		{
			enabled: !!activeLanguage?.id,
			refetchOnWindowFocus: false,
		}
	);

	return [isLoading, data || null];
};

const useAllTags = (): Array<IDictionaryTag> => {
	const activeLanguage = useActiveLanguageConf();
	const { data } = useQuery(
		tagEntryKeys(activeLanguage?.id).all,
		() => (activeLanguage?.id ? getTags(activeLanguage?.id) : []),
		{
			enabled: !!activeLanguage?.id,
			refetchOnWindowFocus: false,
		}
	);

	return data || [];
};

const useTag = (tagId: DictionaryTagID) => {
	const activeLanguage = useActiveLanguageConf();

	const { data } = useQuery(
		tagEntryKeys(activeLanguage?.id).all,
		() => {
			if (!activeLanguage) {
				throw new Error('No Language selected!');
			}
			return getTag({ tagId, language: activeLanguage.id });
		},
		{
			enabled: !!activeLanguage?.id,
			refetchOnWindowFocus: false,
		}
	);
	return data;
};

const useTags = (tagIds: Array<DictionaryTagID>) => {
	const activeLanguage = useActiveLanguageConf();

	const tagsResult = useQueries(
		tagIds.map((tag) => ({
			queryKey: tagEntryKeys(activeLanguage?.id).detail(tag),
			queryFn: () => {
				if (!activeLanguage) {
					throw new Error('no id / language selected!');
				}
				return getTag({ language: activeLanguage.id, tagId: tag });
			},
		}))
	) as Array<UseQueryResult<IDictionaryTag>>;
	return tagsResult.map(({ data }) => data).filter(notUndefined);
};

const useAddDictionaryTag = (): UseMutationResult<
	DictionaryTagID,
	unknown,
	Omit<IDictionaryTag, 'id' | 'lang'>,
	unknown
> => {
	const lang = useActiveLanguageConf();
	//		['dictEntries', 'details', lang, id],
	const queryClient = useQueryClient();
	return useMutation(
		(newTag: Omit<IDictionaryTag, 'id' | 'lang'>) => {
			if (!lang) {
				throw new Error('No Language selected!');
			}
			return addTag({ ...newTag, lang: lang.id }, lang.id);
		},
		{
			onSuccess: (tagID) => {
				queryClient.invalidateQueries(
					tagEntryKeys(lang?.id).detail(tagID)
				);
			},
			onError: (e) => {
				throw e;
			},
		}
	);
};

const useTagSearch = (
	searchTerm: string | undefined
): [boolean, Array<IDictionaryTag> | undefined] => {
	const activeLanguage = useActiveLanguageConf();

	const { data, isLoading } = useQuery(
		tagEntryKeys(activeLanguage?.id).list(searchTerm),
		() => {
			if (!activeLanguage || !searchTerm) {
				throw new Error('No language / searchterm selected!');
			}
			return searchTags({
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

export {
	useAllTags,
	useAddDictionaryTag,
	useTagSearch,
	useDictionaryTag,
	useTag,
	useTags,
};
