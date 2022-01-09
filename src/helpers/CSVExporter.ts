import {
	IDictionaryEntry,
	IDictionaryEntryResolved,
	IDictionarySentence,
	IDictionaryTag,
} from 'Document/Dictionary';
import { DictionaryEntryID, notUndefined } from 'Document/Utility';
import queryClient from './QueryClient';
import { queryKeyFactory } from './queryHelper';

const downloadCsv = (csv: string, fileName: string) => {
	const element = document.createElement('a');
	const file = new Blob([csv], {
		type: 'text/plain',
	});
	element.href = URL.createObjectURL(file);
	element.download = fileName;
	document.body.appendChild(element);
	element.click();
	document.body.removeChild(element);
};

type DictionaryEntryWithTags = Omit<IDictionaryEntryResolved, 'roots'>;

const convertEntriesToCsv = (entries: Array<DictionaryEntryWithTags>) => {
	const csvOutput = entries
		.map(
			(entry) =>
				`${entry.key};${entry.spelling || ''};${
					entry.comment
				};${entry.translations.join(', ')};${entry.tags
					.map((tag) => tag.name.replaceAll(' ', '_'))
					.join(' ')}`
		)
		.join('\n');
	return csvOutput;
};

const dictEntryKeys = queryKeyFactory('entries');
const tagEntryKeys = queryKeyFactory('tags');
const resolveEntryIdsAndExport = (
	entryIds: Array<DictionaryEntryID>,
	language: string
) => {
	const queryKeys = entryIds.map((entryId) =>
		dictEntryKeys(language).detail(entryId)
	);
	const allTags = queryClient.getQueryData(
		tagEntryKeys(language).all
	) as Array<IDictionaryTag>;
	const ResolvedWords = queryKeys.map((queryKey) =>
		queryClient.getQueryData(queryKey)
	) as Array<IDictionaryEntry>;
	const ResolvedWordsWithTags: Array<DictionaryEntryWithTags> =
		ResolvedWords.map((entry) => ({
			...entry,
			tags: entry.tags
				.map((tagId) => allTags.find((tag) => tag.id === tagId))
				.filter(notUndefined),
		}));
	const csv = convertEntriesToCsv(ResolvedWordsWithTags);
	downloadCsv(csv, 'myWords.txt');
};

const convertSentencesToCsv = (sentences: Array<IDictionarySentence>) => {
	const csvOutput = sentences.map(
		(sentence) => `${sentence.content};${sentence.translation}`
	);
	return csvOutput;
};

export {
	convertEntriesToCsv,
	convertSentencesToCsv,
	downloadCsv,
	resolveEntryIdsAndExport,
};
