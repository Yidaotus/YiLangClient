import './Documents.css';
import React, { useState, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import DocumentExcerpt from 'components/DocumentExcerpt/DocumentExcerpt';
import handleError from '@helpers/Error';
import { useActiveLanguageConf } from '@hooks/ConfigQueryHooks';
import { useActiveDocument } from '@hooks/useUserContext';
import ReactPaginate from 'react-paginate';
import {
	useCreateDocument,
	useDeleteEditorDocument,
	useListDocuments,
} from '@hooks/DocumentQueryHooks';
import { Button, Icon } from '@blueprintjs/core';
import PageHeader from '@components/PageHeader/PageHeader';

/**
 * Renders the Dictionary into a Table.
 *
 * Let's the user filter tags, and search other columns
 */
const excerptLength = 100;
const pageSize = 5;

const Documents: React.FC = () => {
	const history = useHistory();
	const [pageSkip, setPageSkip] = useState(0);
	const [, changeActiveDocument] = useActiveDocument();
	const deleteDocument = useDeleteEditorDocument();
	const createDocument = useCreateDocument();
	const [loadingDocuments, documentList] = useListDocuments({
		excerptLength,
		skip: pageSkip,
		limit: pageSize,
		sortBy: 'createdAt',
	});

	const activeLanguage = useActiveLanguageConf();

	const fetchDocumentAndSwitch = useCallback(
		async (id: string) => {
			changeActiveDocument(id);
			history.push(`/home/editor/${id}`);
		},
		[changeActiveDocument, history]
	);

	const removeDocument = useCallback(
		async (id: string) => {
			try {
				await deleteDocument.mutateAsync(id);
			} catch (e) {
				handleError(e);
			}
		},
		[deleteDocument]
	);

	const createNewDocument = useCallback(async () => {
		const newDocumentId = await createDocument.mutateAsync();
		changeActiveDocument(newDocumentId);
		history.push(`/home/editor/${newDocumentId}`);
	}, [changeActiveDocument, createDocument, history]);

	return (
		<>
			<div>
				<PageHeader
					title="Documents"
					subtitle="Manage your documents"
					options={
						<Button
							minimal
							outlined
							title="New"
							onClick={createNewDocument}
						>
							New
						</Button>
					}
				/>
				<div className="excerpt-list">
					{!loadingDocuments &&
						documentList?.excerpts?.length > 0 &&
						documentList.excerpts.map((excerpt) => (
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
					breakLabel={<Icon icon="more" />}
					nextLabel={<Icon icon="chevron-right" />}
					onPageChange={(pageEvent) => {
						setPageSkip(pageEvent.selected * pageSize);
					}}
					pageRangeDisplayed={5}
					pageCount={Math.ceil(documentList?.total / pageSize)}
					previousLabel={<Icon icon="chevron-left" />}
					containerClassName="paginate-container"
					nextClassName="bp3-button bp3-minimal bp3-outlined"
					previousClassName="bp3-button bp3-minimal bp3-outlined"
					pageClassName="paginate-page bp3-button bp3-minimal bp3-outlined"
					activeClassName="bp3-active"
				/>
			</div>
		</>
	);
};

export default Documents;
