import './DocumentExcerpt.css';

import React from 'react';
import { IDocumentExcerpt } from 'api/definitions/api';
import PageHeader from '@components/PageHeader/PageHeader';
import { IconButton, Link } from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';

interface IDocumentExcerptProps {
	excerpt: IDocumentExcerpt;
	selectDocument: (id: string) => void;
	removeDocument?: (id: string) => void;
}

/**
 * Renders the Dictionary into a Table.
 *
 * Let's the user filter tags, and search other columns
 */
const DocumentExcerpt: React.FC<IDocumentExcerptProps> = ({
	excerpt,
	selectDocument,
	removeDocument,
}) => (
	<PageHeader
		title={
			<Link
				component="button"
				onClick={() => {
					selectDocument(excerpt.id);
				}}
			>
				{excerpt.title}
			</Link>
		}
		subtitle={excerpt.excerpt}
		options={
			<IconButton
				onClick={() => {
					removeDocument?.(excerpt.id);
				}}
			>
				<DeleteIcon />
			</IconButton>
		}
	/>
);

export default DocumentExcerpt;
