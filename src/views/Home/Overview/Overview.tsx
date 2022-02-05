import './Overview.css';
import React, { useCallback, useState } from 'react';
import { IDocumentExcerpt } from 'api/definitions/api';
import DocumentExcerpt from '@components/DocumentExcerpt/DocumentExcerpt';
import { useNavigate } from 'react-router';
import DictionaryEntry from '@components/DictionaryEntry/DictionaryEntry';
import { useActiveLanguageConf } from '@hooks/ConfigQueryHooks';
import {
	useListDictionaryEntries,
	useListDictionarySentences,
} from '@hooks/DictionaryQueryHooks';
import { Backdrop, Card, CircularProgress, Divider } from '@mui/material';
import { useListDocuments } from '@hooks/DocumentQueryHooks';

// const excerptsToLoad = 3;
const Overview: React.FC = () => {
	const [loadingExcerpts, setLoadingExcerpts] = useState(false);
	const [loading, setLoading] = useState(false);
	const [excerpts, setExcerpts] = useState<Array<IDocumentExcerpt>>([]);
	const activeLanguage = useActiveLanguageConf();
	const navigate = useNavigate();

	const [loadingEntries, latestDictionaryEntries] = useListDictionaryEntries({
		limit: 5,
		skip: 0,
		sortBy: {
			key: 'createdAt',
			order: 'descend',
		},
		excerptLength: 80,
	});

	const [loadingSentences, latestDictionarySentences] =
		useListDictionarySentences({
			limit: 5,
			skip: 0,
			sortBy: {
				key: 'createdAt',
				order: 'descend',
			},
		});

	const [loadingDocuments, latestDocuments] = useListDocuments({
		limit: 5,
		skip: 0,
		sortBy: 'createdAt',
		excerptLength: 80,
	});

	const fetchDocumentAndSwitch = useCallback(
		(id: string) => {
			navigate(`/home/editor/${id}`);
		},
		[navigate]
	);

	return (
		<div>
			<Backdrop open={!!loading}>
				<CircularProgress color="inherit" />
			</Backdrop>
			<div>
				<Card>
					<h2>Latest Entries</h2>
					{latestDictionaryEntries.entries.map((entry) => (
						<div>
							<p>{entry.key}</p>
							<p>{entry.translations.join(' ')}</p>
						</div>
					))}
				</Card>
				<Card>
					<h2>Latest Sentences</h2>
					{latestDictionarySentences.sentences.map((sentence) => (
						<div>
							<p>{sentence.content}</p>
							<p>{sentence.translation}</p>
						</div>
					))}
				</Card>
				<Card>
					<h2>Latest Documents</h2>
					{latestDocuments.excerpts.map((document) => (
						<div>
							<p>{document.title}</p>
						</div>
					))}
				</Card>
			</div>
		</div>
	);
};

export default Overview;
