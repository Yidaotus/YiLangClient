import { addTag, getTags } from 'api/tags.service';
import { IDictionaryTag } from 'Document/Dictionary';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useActiveLanguageConf } from './ConfigQueryHooks';

const useTags = (): Array<IDictionaryTag> => {
	const lang = useActiveLanguageConf();
	const { data } = useQuery(
		['tags', 'list', lang?.id],
		() => (lang?.id ? getTags(lang?.id) : []),
		{
			enabled: !!lang?.id,
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
		(newTag: Omit<IDictionaryTag, 'id'>) => {
			if (!lang) {
				throw new Error('No Language selected!');
			}
			return addTag({ ...newTag, lang: lang.id }, lang.id);
		},
		{
			onSuccess: () => {
				queryClient.invalidateQueries(['tags', 'list', lang?.id]);
			},
			onError: (e) => {
				throw e;
			},
		}
	);
};

export { useTags, useAddDictionaryTag };
