import './Documents.css';
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import FolderIcon from '@mui/icons-material/Folder';
import DeleteIcon from '@mui/icons-material/Delete';
import handleError from '@helpers/Error';
import { useActiveLanguageConf } from '@hooks/ConfigQueryHooks';
import { useActiveDocument } from '@hooks/useUserContext';
import {
	useCreateDocument,
	useDeleteEditorDocument,
	useListDocuments,
} from '@hooks/DocumentQueryHooks';
import PageHeader from '@components/PageHeader/PageHeader';
import {
	Box,
	Button,
	CircularProgress,
	IconButton,
	Link,
	List,
	ListItem,
	ListItemIcon,
	ListItemText,
	Pagination,
	Paper,
} from '@mui/material';
import ConfirmButton from '@components/ConfirmButton/ConfirmButton';

const excerptLength = 100;
const pageSize = 10;

const Documents: React.FC = () => {
	const navigate = useNavigate();
	const [page, setPage] = useState(0);
	const [, changeActiveDocument] = useActiveDocument();
	const deleteDocument = useDeleteEditorDocument();
	const createDocument = useCreateDocument();
	const [loadingDocuments, documentList] = useListDocuments({
		excerptLength,
		skip: page * pageSize,
		limit: pageSize,
		sortBy: 'createdAt',
	});

	const activeLanguage = useActiveLanguageConf();

	const fetchDocumentAndSwitch = useCallback(
		async (id: string) => {
			changeActiveDocument(id);
			navigate(`/home/editor/${id}`);
		},
		[changeActiveDocument, navigate]
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
		navigate(`/home/editor/${newDocumentId}`);
	}, [changeActiveDocument, createDocument, navigate]);

	return (
		<Paper sx={{ p: 2 }}>
			<PageHeader
				title="Documents"
				subtitle="Manage your documents"
				options={
					<Button
						variant="outlined"
						title="New"
						onClick={createNewDocument}
					>
						New
					</Button>
				}
			/>
			{loadingDocuments && (
				<Box
					sx={{
						width: '100%',
						height: '100%',
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
					}}
				>
					<CircularProgress size={32} sx={{ p: 4 }} />
				</Box>
			)}
			<List>
				{documentList.excerpts.map((excerpt) => (
					<ListItem
						secondaryAction={
							<ConfirmButton
								icon={<DeleteIcon />}
								onConfirm={() => {
									removeDocument(excerpt.id);
								}}
							/>
						}
					>
						<ListItemIcon>
							<FolderIcon />
						</ListItemIcon>
						<ListItemText
							primary={
								<Link
									component="button"
									variant="body2"
									onClick={() => {
										fetchDocumentAndSwitch(excerpt.id);
									}}
								>
									{excerpt.title}
								</Link>
							}
							secondary={excerpt.excerpt}
						/>
					</ListItem>
				))}
			</List>
			{!activeLanguage && <span> No language selected!</span>}
			<Box
				sx={{
					display: 'flex',
					justifyContent: 'center',
				}}
			>
				<Pagination
					page={page + 1}
					onChange={(event, value) => {
						setPage(value - 1);
					}}
					count={Math.ceil(documentList?.total / pageSize)}
				/>
			</Box>
		</Paper>
	);
};

export default Documents;
