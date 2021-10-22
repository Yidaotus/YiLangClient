import './Overview.css';
import React, { useCallback, useState } from 'react';
import { Card, Col, Empty, Row, Space, Spin } from 'antd';
import { IDocumentExcerpt } from 'api/definitions/api';
import DocumentExcerpt from '@components/DocumentExcerpt/DocumentExcerpt';
import { useHistory } from 'react-router';
import DictionaryEntry from '@components/DictionaryEntry/DictionaryEntry';
import handleError from '@helpers/Error';
import { useActiveLanguageConf } from '@hooks/useActiveLanguageConf';
import { useDictionaryEntries } from '@hooks/DictionaryQueryHooks';

const excerptsToLoad = 3;
const Overview: React.FC = () => {
	const [loadingExcerpts, setLoadingExcerpts] = useState(false);
	const [loading, setLoading] = useState(false);
	const [excerpts, setExcerpts] = useState<Array<IDocumentExcerpt>>([]);
	const activeLanguage = useActiveLanguageConf();
	const [loadingEntries, entries] = useDictionaryEntries({
		excerptLength: 0,
		lang: activeLanguage?.key || 'dfl',
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
			<Spin spinning={loading}>
				<Row gutter={24}>
					<Col span={16}>
						<Card title="Latest documents">
							{activeLanguage && (
								<Space
									direction="vertical"
									style={{ width: '100%' }}
								>
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
									{loadingExcerpts && (
										<>
											<Card loading />
											<Card loading />
											<Card loading />
										</>
									)}
									{!loadingExcerpts &&
										excerpts.length < 1 && (
											<Empty
												image={
													Empty.PRESENTED_IMAGE_SIMPLE
												}
											/>
										)}
								</Space>
							)}
							{!activeLanguage && (
								<Empty
									image={Empty.PRESENTED_IMAGE_SIMPLE}
									imageStyle={{
										height: 50,
									}}
									description="No language selected!"
								/>
							)}
						</Card>
					</Col>
					<Col span={8}>
						<Card title="Latest Entries">
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
							{activeLanguage && loadingEntries && (
								<>
									<Card loading />
									<Card loading />
									<Card loading />
								</>
							)}
							{activeLanguage &&
								!loadingEntries &&
								entries.total < 1 && (
									<Empty
										image={Empty.PRESENTED_IMAGE_SIMPLE}
									/>
								)}
							{!activeLanguage && (
								<Empty
									image={Empty.PRESENTED_IMAGE_SIMPLE}
									imageStyle={{
										height: 50,
									}}
									description="No language selected!"
								/>
							)}
						</Card>
					</Col>
				</Row>
			</Spin>
		</div>
	);
};

export default Overview;
