import { getTags } from 'api/tags.service';
import { IDictionaryTag } from 'Document/Dictionary';
import { useQuery } from 'react-query';
import useActiveLanguageConf from './useActiveLanguageConf';

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

export default useTags;
