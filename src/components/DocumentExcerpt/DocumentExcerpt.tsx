import './DocumentExcerpt.css';

import React from 'react';
import { IDocumentExcerpt } from 'api/definitions/api';
import {
	Button,
	Card,
	Divider,
	Intent,
	Menu,
	MenuItem,
	Position,
} from '@blueprintjs/core';
import { Popover2 } from '@blueprintjs/popover2';

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
}) => {
	const moreDropdown = (
		<Menu>
			<MenuItem key="1" icon="edit" text="Edit" />
			<Divider />
			<MenuItem
				key="2"
				icon="trash"
				onClick={() => {
					removeDocument?.(excerpt.id);
				}}
				text="Remove"
				intent={Intent.DANGER}
			/>
		</Menu>
	);

	return (
		<Card key={excerpt.id}>
			<div style={{ display: 'flex', alignItems: 'baseline' }}>
				<h5 className="bp3-heading">
					<a
						onClick={() => selectDocument(excerpt.id)}
						role="link"
						onKeyDown={() => {}}
						tabIndex={0}
					>
						{excerpt.title || 'Doc'}
					</a>
				</h5>
				<div style={{ marginLeft: 'auto' }}>
					<Popover2 content={moreDropdown} placement="bottom">
						<Button icon="more" minimal />
					</Popover2>
				</div>
			</div>
			<p>{excerpt.excerpt}</p>
		</Card>
	);
};

export default DocumentExcerpt;
