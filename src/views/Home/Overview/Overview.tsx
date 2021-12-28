import './Overview.css';
import React, { useCallback, useState } from 'react';
import { IDocumentExcerpt } from 'api/definitions/api';
import DocumentExcerpt from '@components/DocumentExcerpt/DocumentExcerpt';
import { useNavigate } from 'react-router';
import DictionaryEntry from '@components/DictionaryEntry/DictionaryEntry';
import { useActiveLanguageConf } from '@hooks/ConfigQueryHooks';
import { useListDictionaryEntries } from '@hooks/DictionaryQueryHooks';
import { Card, Divider, Elevation, Overlay, Spinner } from '@blueprintjs/core';

// const excerptsToLoad = 3;
const Overview: React.FC = () => {
	const [loadingExcerpts, setLoadingExcerpts] = useState(false);
	const [loading, setLoading] = useState(false);
	const [excerpts, setExcerpts] = useState<Array<IDocumentExcerpt>>([]);
	const activeLanguage = useActiveLanguageConf();
	const [loadingEntries, entries] = useListDictionaryEntries({
		excerptLength: 0,
		limit: 3,
		skip: 0,
	});
	const navigate = useNavigate();

	const fetchDocumentAndSwitch = useCallback(
		(id: string) => {
			navigate(`/home/editor/${id}`);
		},
		[navigate]
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
					</Card>
				</div>
			</div>
		</div>
	);
};

export default Overview;
