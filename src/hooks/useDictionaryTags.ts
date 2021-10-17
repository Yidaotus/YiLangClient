import { IRootState } from '@store/index';
import { IDictionaryTag } from 'Document/Dictionary';
import { notUndefined } from 'Document/Utility';
import { UUID } from 'Document/UUID';
import { useSelector } from 'react-redux';

const useDictionaryEntry = (tags: Array<UUID>): Array<IDictionaryTag> => {
	const userTags = useSelector((state: IRootState) => state.dictionary.tags);

	return tags.map((tagId) => userTags[tagId]).filter(notUndefined);
};

export default useDictionaryEntry;
