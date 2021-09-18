import React, { useEffect, useState } from 'react';
import './WordsPanel.css';

import { List, Empty } from 'antd';
import {
	ResolvedFragment,
	ISentenceFragmentData,
	IWordFragmentData,
	isFragmentType,
} from 'Document/Fragment';
import { UUID } from 'Document/UUID';

import { useDispatch, useSelector } from 'react-redux';
import { IRootDispatch, IRootState } from 'store';
import { IDictionaryEntryResolved } from 'Document/Dictionary';
import DictEntryWithEdit from '@components/DictionaryEntry/DictEntryWithEdit/DictEntryWithEdit';
import { IEntryFormFields } from '@components/DictionaryEntry/EntryForm/EntryForm';
import { saveOrUpdateEntryInput } from '@store/dictionary/actions';
import { selectActiveFragmentLayer } from '@store/editor/selectors';
import { notUndefined } from 'Document/Utility';
import useLazyDictionary from '@hooks/useLazyDictionary';
import handleError from '@helpers/Error';

const WordsPanel: React.FC = () => {
	const documentId = useSelector(
		(state: IRootState) => state.editor.document?.id
	);
	const fragmentables = useSelector(
		(state: IRootState) => state.editor.fragmentables
	);
	const fragments = useSelector(selectActiveFragmentLayer);
	const [tableData, setTableData] = useState<
		Array<{ id: UUID } & IDictionaryEntryResolved>
	>([]);

	const dictionaryFetcher = useLazyDictionary();
	const dispatch: IRootDispatch = useDispatch();

	useEffect(() => {
		const formatEntries = async () => {
			let sentences: Array<ResolvedFragment<ISentenceFragmentData>> = [];
			let words: Array<ResolvedFragment<IWordFragmentData>> = [];

			if (!fragments) {
				return;
			}

			for (const fragmentable of Object.values(fragmentables)) {
				const sentenceFragments = fragmentable.fragments
					.map((fragId) => fragments[fragId])
					.filter(notUndefined)
					.filter(isFragmentType('Sentence'))
					.map((fragment) => ({
						...fragment,
						value: fragmentable.root.substring(
							fragment.range.start,
							fragment.range.end
						),
					}));
				sentences = sentences.concat(sentenceFragments);
				const wordFragments = fragmentable.fragments
					.map((fragId) => fragments[fragId])
					.filter(notUndefined)
					.filter(isFragmentType('Word'))
					.map((fragment) => ({
						...fragment,
						value: fragmentable.root.substring(
							fragment.range.start,
							fragment.range.end
						),
					}));
				words = words.concat(wordFragments);
			}

			const tableDataMap: Map<
				UUID,
				{ id: UUID } & IDictionaryEntryResolved
			> = new Map();

			const promises = [];
			for (const word of words) {
				promises.push(
					dictionaryFetcher(word.data.dictId).then((dictEntry) => {
						if (dictEntry) {
							tableDataMap.set(word.data.dictId, {
								...dictEntry,
								id: word.data.dictId,
							});
							if (dictEntry.root) {
								const isSourceDocument =
									dictEntry.root.firstSeen?.documentId ===
									documentId;
								if (isSourceDocument) {
									tableDataMap.set(dictEntry.root.id, {
										...dictEntry.root,
									});
								}
							}
						}
					})
				);
			}
			for (const sentence of sentences) {
				for (const word of sentence.data.words) {
					promises.push(
						dictionaryFetcher(word.data.dictId).then(
							(dictEntry) => {
								if (dictEntry) {
									tableDataMap.set(
										word.data.dictId,
										dictEntry
									);
								}
							}
						)
					);
				}
			}

			try {
				await Promise.allSettled(promises);
			} catch (e) {
				handleError(e);
			}
			setTableData([...tableDataMap.values()]);
		};
		formatEntries();
	}, [dictionaryFetcher, documentId, fragmentables, fragments]);

	const saveOrUpdateEntry = (entry: IEntryFormFields) => {
		if (entry) {
			dispatch(saveOrUpdateEntryInput(entry));
		}
	};

	return (
		<div className="word-container">
			{tableData.length > 0 ? (
				<List
					grid={{
						gutter: 16,
						column: 3,
					}}
					dataSource={tableData}
					renderItem={(word) => (
						<List.Item className="word-container-list">
							<DictEntryWithEdit
								dictEntry={word}
								saveEntry={(entry) => {
									if (entry) {
										saveOrUpdateEntry(entry);
									}
								}}
							/>
						</List.Item>
					)}
				/>
			) : (
				<Empty
					image={Empty.PRESENTED_IMAGE_SIMPLE}
					description={<span>Added Words will be listed here</span>}
				/>
			)}
		</div>
	);
};

export default React.memo(WordsPanel);
