import './Overview.css';
import React, { useCallback, useEffect, useState } from 'react';
import { IRootDispatch, IRootState } from '@store/index';
import { Card, Col, Empty, Row, Space, Spin } from 'antd';
import { listDocuments } from 'api/document.service';
import { useDispatch, useSelector } from 'react-redux';
import { IDocumentExcerpt } from 'api/definitions/api';
import DocumentExcerpt from '@components/DocumentExcerpt/DocumentExcerpt';
import { UUID } from 'Document/UUID';
import { useHistory } from 'react-router';
import { IDictionaryEntryResolved } from 'Document/Dictionary';
import { listDictionary } from 'api/dictionary.service';
import { notUndefined } from 'Document/Utility';
import DictionaryEntry from '@components/DictionaryEntry/DictionaryEntry';
import handleError from '@helpers/Error';
import { selectActiveLanguageConfig } from '@store/user/selectors';

const excerptsToLoad = 3;

const Overview: React.FC = () => {
	const [loadingExcerpts, setLoadingExcerpts] = useState(false);
	const [loadingEntries, setLoadingEntries] = useState(false);
	const [loading, setLoading] = useState(false);
	const [excerpts, setExcerpts] = useState<Array<IDocumentExcerpt>>([]);
	const [entries, setEntries] = useState<Array<IDictionaryEntryResolved>>([]);
	const history = useHistory();

	const cachedTags = useSelector(
		(state: IRootState) => state.dictionary.tags
	);
	const activeLanguage = useSelector(selectActiveLanguageConfig);

	useEffect(() => {
		const fetchData = async () => {
			setLoadingEntries(true);

			try {
				if (!activeLanguage) {
					return;
				}
				const list = await listDictionary({
					excerptLength: 0,
					skip: 0,
					limit: 3,
					lang: activeLanguage.key,
					sortBy: { key: 'createdAt', order: 'descend' },
				});
				const denormalizedEntries = list.entries.map((entry) => ({
					...entry,
					root: undefined,
					tags: entry.tags
						.map((tagId) => cachedTags[tagId])
						.filter(notUndefined),
				}));
				setEntries(denormalizedEntries);
			} catch (e) {
				handleError(e);
			}
			setLoadingEntries(false);
		};

		fetchData();
	}, [cachedTags, activeLanguage]);

	useEffect(() => {
		const fetchData = async () => {
			setLoadingExcerpts(true);

			try {
				if (!activeLanguage) {
					return;
				}
				const result = await listDocuments({
					excerptLength: 100,
					skip: 0,
					limit: excerptsToLoad,
					sortBy: 'createdAt',
					lang: activeLanguage.key,
				});
				setExcerpts(result.excerpts);
			} catch (e) {
				handleError(e);
			}
			setLoadingExcerpts(false);
		};

		fetchData();
	}, [activeLanguage]);

	const fetchDocumentAndSwitch = useCallback(
		async (id: UUID) => {
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
								entries.length > 0 &&
								entries.map((entry) => (
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
								entries.length < 1 && (
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
