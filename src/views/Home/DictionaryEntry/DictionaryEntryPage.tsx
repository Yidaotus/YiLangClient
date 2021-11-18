import './DictionaryEntryPage.css';
import React, { useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { IExcerptedDocumentLink } from 'Document/Document';
import DocumentLink from '@components/DictionaryEntry/DocumentLink';
import DictEntryWithEdit from '@components/DictionaryEntry/DictEntryWithEdit/DictEntryWithEdit';
import DictionaryEntry from '@components/DictionaryEntry/DictionaryEntry';
import { IDictionaryEntryResolved } from 'Document/Dictionary';
import {
	useDictionaryEntryResolved,
	useDictionarySentence,
	useDictionarySentencesByWord,
} from '@hooks/DictionaryQueryHooks';
import PageHeader from '@components/PageHeader/PageHeader';
import { Card, Divider, Spinner } from '@blueprintjs/core';

interface IDictionaryEntryViewParams {
	entryId: string;
}

/**
 * Renders the Dictionary into a Table.
 *
 * Let's the user filter tags, and search other columns
 */
const DictionaryEntryPage: React.FC = () => {
	const [loading, setLoading] = useState(false);
	const [excerptLink, setExcerptLink] =
		useState<IExcerptedDocumentLink | null>(null);
	const [additionalExcerpts, setAdditionalExcerpt] = useState<
		Array<IExcerptedDocumentLink>
	>([]);

	const history = useHistory();
	const { entryId } = useParams<IDictionaryEntryViewParams>();
	const [loadingMain, entry] = useDictionaryEntryResolved(entryId);
	const [loadingRoot, rootEntry] = useDictionaryEntryResolved(
		entry?.root || null
	);
	const [subDictEntries, setSubDictEntries] = useState<
		Array<IDictionaryEntryResolved>
	>([]);
	const [sentencesLoading, sentences] = useDictionarySentencesByWord(entryId);
	const [firstSeenLoading, firstSeen] = useDictionarySentence(
		entry?.firstSeen?.sentenceId || null
	);

	return (
		<div>
			<PageHeader title="Dictionary" subtitle="Everything dictionary" />
			{loading && <Spinner />}
			<div>
				<div>
					{loadingMain && <Spinner />}
					{entry && (
						<Card title="Entry">
							<DictEntryWithEdit
								dictEntry={entry}
								canRemove
								root={rootEntry || undefined}
							/>
						</Card>
					)}
				</div>
			</div>
			<Divider />
			<div>
				<div>
					{rootEntry && (
						<DictionaryEntry entryId={rootEntry.id} canLink />
					)}
				</div>
				<div>
					{subDictEntries.length > 0 &&
						subDictEntries.map((entryItem) => (
							<DictionaryEntry entryId={entryItem.id} canLink />
						))}
				</div>
			</div>
			{firstSeen && (
				<div>
					firstSeenLoading && <Spinner />
					<p>{firstSeen.content}</p>
					<p>{firstSeen.translation}</p>
				</div>
			)}
			{sentences &&
				sentences.map((sentence) => (
					<span className="ellipsed">
						<p>{sentence.content}</p>
						<p>{sentence.translation}</p>
					</span>
				))}

			{excerptLink && (
				<span className="ellipsed">
					<DocumentLink
						link={excerptLink.link}
						excerpt={excerptLink.excerpt}
						word={entry?.key || ''}
					/>
				</span>
			)}
			{additionalExcerpts.length > 0 &&
				additionalExcerpts.map((excerpt) => (
					<span className="ellipsed">
						<DocumentLink
							link={excerpt.link}
							excerpt={excerpt.excerpt}
							word={entry?.key || ''}
						/>
					</span>
				))}
		</div>
	);
};

export default DictionaryEntryPage;
