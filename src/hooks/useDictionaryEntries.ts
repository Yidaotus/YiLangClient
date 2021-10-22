import {
	IListDictionaryParams,
	IListDictionaryResult,
} from 'api/definitions/api';
import { listDictionary } from 'api/dictionary.service';
import { useQuery } from 'react-query';
import { useActiveLanguageConf } from './useActiveLanguageConf';

const defaultValue = {
	total: 0,
	entries: [],
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

export default useDictionaryEntries;
