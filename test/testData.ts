import { IConfig } from 'Document/Config';
import { IDictionaryEntry, IDictionaryTag } from 'Document/Dictionary';
import { DictionaryEntryID, DictionaryTagID } from 'Document/Utility';

const testLanguageConfig: IConfig = {
	languageConfigs: [
		{
			id: 'main',
			name: 'debugMain',
			lookupSources: [],
		},
	],
	activeLanguage: 'main',
	editorConfig: {
		autoSave: true,
		saveEveryNActions: 10,
	},
};

const testDictionarySearchResponse: Array<IDictionaryEntry> = [
	{
		id: 'testEntryId1' as DictionaryEntryID,
		key: 'testEntryKey1',
		lang: 'testLang1',
		translations: ['testColor1'],
		createdAt: new Date(),
		roots: [],
		tags: [],
	},
	{
		id: 'testEntryId2' as DictionaryEntryID,
		key: 'testEntryKey2',
		lang: 'testLang1',
		translations: ['testColor1'],
		createdAt: new Date(),
		roots: [],
		tags: [],
	},
	{
		id: 'testEntryId3' as DictionaryEntryID,
		key: 'testEntryKey3',
		lang: 'testLang1',
		translations: ['testColor1'],
		createdAt: new Date(),
		roots: [],
		tags: [],
	},
];

const testTagSearchResponse: ReadonlyArray<IDictionaryTag> = [
	{
		id: 'testId1' as DictionaryTagID,
		name: 'testTagResult1',
		lang: 'testLang1',
		color: 'testColor1',
	},
	{
		id: 'testId2' as DictionaryTagID,
		name: 'testTagResult2',
		lang: 'testLang2',
		color: 'testColor2',
	},
	{
		id: 'testId3' as DictionaryTagID,
		name: 'testTagResult3',
		lang: 'testLang3',
		color: 'testColor3',
	},
] as const;

export {
	testLanguageConfig,
	testTagSearchResponse,
	testDictionarySearchResponse,
};
