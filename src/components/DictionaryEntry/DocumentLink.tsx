import React, { useCallback } from 'react';
import { useHistory } from 'react-router';
import Highlighter from 'react-highlight-words';
import Link from 'antd/lib/typography/Link';
import { IDocumentLink } from 'Document/Dictionary';

const DocumentLink: React.FC<{
	link: IDocumentLink;
	excerpt: string;
	word: string;
}> = ({ link, excerpt, word }) => {
	const history = useHistory();

	const fetchDocumentAndSwitch = useCallback(() => {
		history.push(`/home/editor/${link.documentId}`);
	}, [history, link.documentId]);
	return (
		<Link onClick={() => fetchDocumentAndSwitch()}>
			{
				// TODO Use FragmentedString and not a 3rd party highlighter
			}
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
