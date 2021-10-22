import { addTag, getTags } from 'api/tags.service';
import { IDictionaryTag } from 'Document/Dictionary';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useActiveLanguageConf } from './useActiveLanguageConf';

const useTags = (): Array<IDictionaryTag> => {
	const lang = useActiveLanguageConf();
	const { data } = useQuery(
		['tags', 'list', lang?.key],
		() => (lang?.key ? getTags(lang?.key) : []),
		{
			enabled: !!lang?.key,
			refetchOnWindowFocus: false,
		}
	);

	return data || [];
};

const useAddDictionaryTag = () => {
	const lang = useActiveLanguageConf();
	//		['dictEntries', 'details', lang, id],
	const queryClient = useQueryClient();
	return useMutation(
		(newTag: IDictionaryTag) => {
			if (!lang) {
				throw new Error('No Language selected!');
			}
			return addTag({ lang: lang.key, tag: newTag });
		},
		{
			onSuccess: () => {
				queryClient.invalidateQueries(['tags', 'list', lang]);
			},
			onError: (e) => {
				throw e;
			},
		}
	);
};

export { useTags, useAddDictionaryTag };
