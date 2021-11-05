import { IDictionaryLookupSource } from 'Document/Config';
import React from 'react';
import { Button } from 'antd';

export interface ILookupSourceLinkProps {
	source: IDictionaryLookupSource;
	searchTerm: string;
}

const formatURL = ({ source, searchTerm }: ILookupSourceLinkProps): string =>
	source.source.replace('{}', searchTerm);

const LookupSourceButton: React.FC<ILookupSourceLinkProps> = ({
	source,
	searchTerm,
}) => {
	const url = formatURL({ source, searchTerm });
	const target = '_blank';
	return (
		<Button
			onClick={() => {
				window.open(url, target);
			}}
		>
			{source.name}
		</Button>
	);
};

export default LookupSourceButton;
export { formatURL };
