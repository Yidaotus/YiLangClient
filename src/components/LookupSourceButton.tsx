import { IDictionaryLookupSource } from 'Document/Config';
import React from 'react';
import { useSlateStatic } from 'slate-react';
import { Editor } from 'slate';
import { MenuItem } from '@mui/material';

export interface ILookupSourceLinkProps {
	source: IDictionaryLookupSource;
}

const formatURL = ({
	source,
	searchTerm,
}: {
	source: IDictionaryLookupSource;
	searchTerm: string;
}): string => source.source.replace('{}', searchTerm);

const LookupSourceButton: React.FC<ILookupSourceLinkProps> = ({ source }) => {
	const editor = useSlateStatic();
	const target = '_blank';
	return (
		<MenuItem
			onClick={() => {
				if (editor.selection) {
					const searchTerm =
						Editor.string(editor, editor.selection) || '';
					const url = formatURL({ source, searchTerm });
					window.open(url, target);
				}
			}}
		>
			{source.name}
		</MenuItem>
	);
};

export default LookupSourceButton;
export { formatURL };
