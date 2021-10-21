import DictionaryEntry from '@components/DictionaryEntry/DictionaryEntry';
import { selectAddedDictionaryEntries } from '@store/dictionary/selectors';
import React from 'react';
import { useSelector } from 'react-redux';

const WordsPanel: React.FC = () => {
	const addedEntries = useSelector(selectAddedDictionaryEntries);

	return (
		<div>
			{addedEntries.map((v) => (
				<DictionaryEntry entryId={v.id} />
			))}
		</div>
	);
};

export default WordsPanel;
