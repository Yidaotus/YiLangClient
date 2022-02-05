import {
	entryQueryFactory,
	sentenceQueryFactory,
} from '@hooks/DictionaryQueryHooks';
import { allTagsQueryFactory } from '@hooks/useTags';
import {
	IDictionaryEntry,
	IDictionaryEntryResolved,
	IDictionarySentence,
	IDictionaryTag,
} from 'Document/Dictionary';
import {
	DictionaryEntryID,
	DictionarySentenceID,
	notUndefined,
} from 'Document/Utility';
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
const dictSentenceKeys = queryKeyFactory('sentences');
const tagEntryKeys = queryKeyFactory('tags');
const resolveEntryIdsAndExport = async (
	entryIds: Array<DictionaryEntryID>,
	language: string
) => {
	const queryKeys = entryIds.map((entryId) =>
		dictEntryKeys(language).detail(entryId)
	);
	const allTags = (await queryClient.fetchQuery(
		tagEntryKeys(language).all,
		allTagsQueryFactory(language)
	)) as Array<IDictionaryTag>;

	const resolvedWordsPromises = queryKeys.map((queryKey) =>
		queryClient.fetchQuery(
			queryKey,
			entryQueryFactory(queryKey[3], queryKey[1])
		)
	) as Array<Promise<IDictionaryEntry>>;

	const resolvedWords = await Promise.all(resolvedWordsPromises);
	const resolvedWordsWithTags: Array<DictionaryEntryWithTags> =
		resolvedWords.map((entry) => ({
			...entry,
			tags: entry.tags
				.map((tagId) => allTags.find((tag) => tag.id === tagId))
				.filter(notUndefined),
		}));
	const csv = convertEntriesToCsv(resolvedWordsWithTags);
	downloadCsv(csv, 'entries.txt');
};

const convertSentencesToCsv = (sentences: Array<IDictionarySentence>) => {
	const csvOutput = sentences
		.map((sentence) => `${sentence.content};${sentence.translation}`)
		.join('\n');
	return csvOutput;
};

const resolveSentenceIdsAndExport = async (
	sentenceIds: Array<DictionarySentenceID>,
	language: string
) => {
	const queryKeys = sentenceIds.map((sentenceId) =>
		dictSentenceKeys(language).detail(sentenceId)
	);
	const sentenceFetchPromises = queryKeys.map((queryKey) =>
		queryClient.fetchQuery(
			queryKey,
			sentenceQueryFactory(queryKey[3], queryKey[1])
		)
	) as Array<Promise<IDictionarySentence>>;
	const resolvedSentences = await Promise.all(sentenceFetchPromises);
	const csv = convertSentencesToCsv(resolvedSentences);
	downloadCsv(csv, 'sentences.txt');
};

export {
	convertEntriesToCsv,
	convertSentencesToCsv,
	downloadCsv,
	resolveSentenceIdsAndExport,
	resolveEntryIdsAndExport,
};
