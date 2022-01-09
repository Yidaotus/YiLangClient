import React, { useCallback } from 'react';
import { useNavigate } from 'react-router';
import Highlighter from 'react-highlight-words';
import { IDocumentLink } from 'Document/Dictionary';
import { Link } from '@mui/material';

const DocumentLink: React.FC<{
	link: IDocumentLink;
	excerpt: string;
	word: string;
}> = ({ link, excerpt, word }) => {
	const navigate = useNavigate();

	const fetchDocumentAndSwitch = useCallback(() => {
		navigate(`/home/editor/${link.documentId}`);
	}, [link.documentId, navigate]);
	return (
		<Link
			component="button"
			variant="body2"
			onClick={() => fetchDocumentAndSwitch()}
		>
			<Highlighter
				highlightStyle={{
					backgroundColor: '#ffc069',
					padding: 0,
				}}
				searchWords={[word]}
				autoEscape
				textToHighlight={excerpt}
			/>
		</Link>
	);
};

export default DocumentLink;
