import './Overview.css';
import React, { useCallback, useState } from 'react';
import { IDocumentExcerpt } from 'api/definitions/api';
import DocumentExcerpt from '@components/DocumentExcerpt/DocumentExcerpt';
import { useHistory } from 'react-router';
import DictionaryEntry from '@components/DictionaryEntry/DictionaryEntry';
import handleError from '@helpers/Error';
import { useActiveLanguageConf } from '@hooks/ConfigQueryHooks';
import { useDictionaryEntries } from '@hooks/DictionaryQueryHooks';
import { Card, Divider, Elevation, Overlay, Spinner } from '@blueprintjs/core';

const excerptsToLoad = 3;
const Overview: React.FC = () => {
	const [loadingExcerpts, setLoadingExcerpts] = useState(false);
	const [loading, setLoading] = useState(false);
	const [excerpts, setExcerpts] = useState<Array<IDocumentExcerpt>>([]);
	const activeLanguage = useActiveLanguageConf();
	const [loadingEntries, entries] = useDictionaryEntries({
		excerptLength: 0,
		limit: 3,
		skip: 0,
	});
	const history = useHistory();

	const fetchDocumentAndSwitch = useCallback(
		async (id: string) => {
			setLoading(true);
			try {
				// await dispatch(loadDocument({ type: 'load', id }));
				history.push('/home/editor/new');
			} catch (e) {
				handleError(e);
			}
			setLoading(false);
		},
		[history]
	);

	return (
		<div>
			<Overlay isOpen={!!loading} usePortal={false}>
				<Spinner />
			</Overlay>
			<div>
				<div>
					<Card title="Latest documents">
						{activeLanguage && (
							<div style={{ width: '100%' }}>
								{!loadingExcerpts &&
									excerpts.length > 0 &&
									excerpts.map((excerpt) => (
										<DocumentExcerpt
											key={excerpt.id}
											excerpt={excerpt}
											selectDocument={
												fetchDocumentAndSwitch
											}
										/>
									))}
								{!loadingExcerpts && excerpts.length < 1 && (
									<span>No Excerpts</span>
								)}
							</div>
						)}
						{!activeLanguage && <span>No language selected!</span>}
					</Card>
				</div>
				<div>
					<Card elevation={Elevation.TWO}>
						<h2 className="bp3-heading">Latest Entries</h2>
						<Divider />
						{activeLanguage &&
							!loadingEntries &&
							entries.total > 0 &&
							entries.entries.map((entry) => (
								<DictionaryEntry
									key={entry.id}
									entryId={entry.id}
									canLink
								/>
							))}
						{activeLanguage &&
							!loadingEntries &&
							entries.total < 1 && <span>No Entries</span>}
						{!activeLanguage && <span>No language selected!</span>}
					</Card>
				</div>
			</div>
		</div>
	);
};

export default Overview;
