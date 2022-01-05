import {
	IDictionaryEntryResolved,
	IDictionarySentence,
} from 'Document/Dictionary';

const convertEntriesToCsv = (entries: Array<IDictionaryEntryResolved>) => {
	const csvOutput = entries.map(
		(entry) =>
			`${entry.key};${entry.spelling || ''};${
				entry.comment
			};${entry.translations.join(' ')};${entry.tags
				.map((tag) => tag.name)
				.join(' ')}}`
	);
	return csvOutput;
};

const convertSentencesToCsv = (sentences: Array<IDictionarySentence>) => {
	const csvOutput = sentences.map(
		(sentence) => `${sentence.content};${sentence.translation}`
	);
	return csvOutput;
};

export { convertEntriesToCsv, convertSentencesToCsv };
