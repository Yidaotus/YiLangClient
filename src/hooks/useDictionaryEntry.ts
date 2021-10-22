import { getEntry } from 'api/dictionary.service';
import { IDictionaryEntry } from 'Document/Dictionary';
import { useQuery } from 'react-query';
import { useActiveLanguageConf } from './useActiveLanguageConf';

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

export default useDictionaryEntry;
