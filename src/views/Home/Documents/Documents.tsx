import './Documents.css';
import React, { useEffect, useState, useCallback } from 'react';
import { IDocumentExcerpt } from 'api/definitions/api';
import { listDocuments } from 'api/document.service';
import { useHistory } from 'react-router-dom';
import DocumentExcerpt from 'components/DocumentExcerpt/DocumentExcerpt';
import handleError from '@helpers/Error';
import { useActiveLanguageConf } from '@hooks/ConfigQueryHooks';
import { useActiveDocument } from '@hooks/useUserContext';
import ReactPaginate from 'react-paginate';

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
	const [activeDocument, changeActiveDocument] = useActiveDocument();

	const activeLanguage = useActiveLanguageConf();

	const fetchDocumentAndSwitch = useCallback(
		async (id: string) => {
			changeActiveDocument(id);
			history.push(`/home/editor/${id}`);
		},
		[history, changeActiveDocument]
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
				lang: activeLanguage.id,
			});
			setExcerpts(result.excerpts);
			setTotal(result.total);
		} catch (e) {
			handleError(e);
		}

		setLoading(null);
	}, [pageSkip, activeLanguage]);

	const removeDocument = useCallback(
		async (id: string) => {
			setLoading('Removing Document');
			try {
				// dispatch(deleteDocument(id));
				fetchData();
			} catch (e) {
				handleError(e);
			}
			setLoading(null);
		},
		[fetchData]
	);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	return (
		<>
			<div>
				<div className="excerpt-list">
					{activeLanguage &&
						!loading &&
						excerpts.length > 0 &&
						excerpts.map((excerpt) => (
							<DocumentExcerpt
								key={excerpt.id}
								excerpt={excerpt}
								selectDocument={fetchDocumentAndSwitch}
								removeDocument={removeDocument}
							/>
						))}
					{!activeLanguage && <span> No language selected!</span>}
				</div>
			</div>
			<div>
				<ReactPaginate
					marginPagesDisplayed={100}
					breakLabel="..."
					nextLabel="next >"
					onPageChange={(pageEvent) => {
						setPageSkip(pageEvent.selected * pageSize);
						setCurrentPage(pageEvent.selected);
					}}
					pageRangeDisplayed={5}
					pageCount={Math.ceil(total / pageSize)}
					previousLabel="< previous"
				/>
			</div>
		</>
	);
};

export default Documents;
