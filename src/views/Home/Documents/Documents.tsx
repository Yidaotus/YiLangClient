import './Documents.css';
import React, { useEffect, useState, useCallback } from 'react';
import { IDocumentExcerpt } from 'api/definitions/api';
import { listDocuments } from 'api/document.service';
import { Card, Col, Empty, Pagination, Row, Space, Spin } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { deleteDocument, loadDocument } from 'store/editor/actions';
import { UUID } from 'Document/UUID';
import { useHistory } from 'react-router-dom';
import DocumentExcerpt from 'components/DocumentExcerpt/DocumentExcerpt';
import handleError from '@helpers/Error';
import { selectActiveLanguageConfig } from '@store/user/selectors';
import { IRootDispatch } from '@store/index';

/**
 * Renders the Dictionary into a Table.
 *
 * Let's the user filter tags, and search other columns
 */
const excerptLength = 100;
const pageSize = 5;

const Documents: React.FC = () => {
	const history = useHistory();
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState<string | null>(null);
	const [pageSkip, setPageSkip] = useState(0);
	const [currentPage, setCurrentPage] = useState(1);
	const [excerpts, setExcerpts] = useState<Array<IDocumentExcerpt>>([]);
	const dispatch: IRootDispatch = useDispatch();

	const activeLanguage = useSelector(selectActiveLanguageConfig);

	const fetchDocumentAndSwitch = useCallback(
		async (id: UUID) => {
			setLoading('Loading Document');
			try {
				await dispatch(loadDocument({ type: 'load', id }));
				history.push('/home/editor/new');
			} catch (e) {
				handleError(e);
			}
			setLoading(null);
		},
		[dispatch, history]
	);

	const fetchData = useCallback(async () => {
		setLoading('Loading Documents');

		try {
			if (!activeLanguage) {
				return;
			}
			const result = await listDocuments({
				excerptLength,
				skip: pageSkip,
				limit: pageSize,
				sortBy: 'createdAt',
				lang: activeLanguage.key,
			});
			setExcerpts(result.excerpts);
			setTotal(result.total);
		} catch (e) {
			handleError(e);
		}

		setLoading(null);
	}, [pageSkip, activeLanguage]);

	const removeDocument = useCallback(
		async (id: UUID) => {
			setLoading('Removing Document');
			try {
				dispatch(deleteDocument(id));
				fetchData();
			} catch (e) {
				handleError(e);
			}
			setLoading(null);
		},
		[dispatch, fetchData]
	);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	return (
		<>
			<Row>
				<Col span={24}>
					{activeLanguage && (
						<Spin
							size="large"
							spinning={!!loading}
							tip={loading || ''}
						>
							<Space
								direction="vertical"
								style={{ width: '100%' }}
							>
								{!loading &&
									excerpts.length > 0 &&
									excerpts.map((excerpt) => (
										<DocumentExcerpt
											key={excerpt.id}
											excerpt={excerpt}
											selectDocument={
												fetchDocumentAndSwitch
											}
											removeDocument={removeDocument}
										/>
									))}
								{loading && <Card loading />}
								{!loading && excerpts.length < 1 && (
									<Empty
										image={Empty.PRESENTED_IMAGE_SIMPLE}
									/>
								)}
							</Space>
						</Spin>
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
				</Col>
			</Row>
			<Row justify="center" style={{ marginTop: '15px' }}>
				<Pagination
					pageSize={pageSize}
					total={total}
					current={currentPage}
					onChange={(page, currentPageSize) => {
						setPageSkip((page - 1) * (currentPageSize || pageSize));
						setCurrentPage(page);
					}}
				/>
			</Row>
		</>
	);
};

export default Documents;
