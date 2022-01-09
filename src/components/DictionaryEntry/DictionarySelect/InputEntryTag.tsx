import { useDictionaryTag } from '@hooks/useTags';
import { DictionaryTagID } from 'Document/Utility';
import React from 'react';

const InputEntryTag: React.FC<{ tagID: DictionaryTagID }> = ({ tagID }) => {
	const [, tag] = useDictionaryTag(tagID);
	return <span>{tag && tag.name}</span>;
};

export default InputEntryTag;
