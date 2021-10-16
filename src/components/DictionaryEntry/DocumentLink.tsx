import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router';
import Highlighter from 'react-highlight-words';
import Link from 'antd/lib/typography/Link';
import handleError from '@helpers/Error';
import { IRootDispatch } from '@store/index';
import { IDocumentLink } from 'Document/Dictionary';

const DocumentLink: React.FC<{
	link: IDocumentLink;
	excerpt: string;
	word: string;
}> = ({ link, excerpt, word }) => {
	const history = useHistory();
	const dispatch: IRootDispatch = useDispatch();

	const fetchDocumentAndSwitch = useCallback(async () => {
		// setLoading('Loading Document');
		try {
			// await dispatch(loadDocument({ type: 'load', id: link.documentId }));
			history.push('/home/editor/new');
		} catch (e) {
			handleError(e);
		}
		// setLoading(null);
	}, [history]);
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
