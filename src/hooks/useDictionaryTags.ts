import { StoreMap, IRootState } from '@store/index';
import { IDictionaryTag } from 'Document/Dictionary';
import { useSelector } from 'react-redux';

const useDictionaryTags = (): StoreMap<IDictionaryTag> => {
	const userTags = useSelector((state: IRootState) => state.dictionary.tags);
	return userTags;
};

export default useDictionaryTags;
