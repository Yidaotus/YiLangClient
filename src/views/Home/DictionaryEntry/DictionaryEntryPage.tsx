import './DictionaryEntryPage.css';
import React, { useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { IExcerptedDocumentLink } from 'Document/Document';
import DocumentLink from '@components/DictionaryEntry/DocumentLink';
import DictEntryWithEdit from '@components/DictionaryEntry/DictEntryWithEdit/DictEntryWithEdit';
import DictionaryRootEntry from '@components/DictionaryEntry/DictionaryRootEntry';
import {
	useDictionaryEntryResolved,
	useDictionarySentence,
	useDictionarySentencesByWord,
} from '@hooks/DictionaryQueryHooks';
import PageHeader from '@components/PageHeader/PageHeader';
import { Card, Divider, NonIdealState, Spinner } from '@blueprintjs/core';

/**
 * Renders the Dictionary into a Table.
 *
 * Let's the user filter tags, and search other columns
 */
const DictionaryEntryPage: React.FC = () => {
	const [excerptLink] = useState<IExcerptedDocumentLink | null>(null);
	const [additionalExcerpts] = useState<Array<IExcerptedDocumentLink>>([]);

	const navigate = useNavigate();
	const { entryId } = useParams();
	const [loadingMain, entry] = useDictionaryEntryResolved(entryId);
	const [, sentences] = useDictionarySentencesByWord(entryId);
	const [, firstSeen] = useDictionarySentence(entry?.firstSeen?.sentenceId);

	const afterRemove = useCallback(() => {
		navigate(-1);
	}, [navigate]);

	return (
		<div>
			<PageHeader title="Dictionary" subtitle="Everything dictionary" />
			<div>
				<div>
					{loadingMain && <Spinner />}
					{entry && (
						<Card title="Entry">
							<DictEntryWithEdit
								dictEntry={entry}
								canRemove
								removeCallback={afterRemove}
							/>
						</Card>
					)}
					{!entry && !loadingMain && (
						<NonIdealState
							icon="error"
							description="Entry not found"
							title="Error"
						/>
					)}
				</div>
			</div>
			<Divider />
			<div>
				<div>
					{entry?.roots.map((root) => (
						<div key={root.id}>
							<DictionaryRootEntry entry={root} canLink />
						</div>
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
