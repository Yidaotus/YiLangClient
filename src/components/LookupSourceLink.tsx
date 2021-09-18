import { IDictionaryLookupSource } from 'Document/Config';
import React from 'react';

export interface ILookupSourceLinkProps {
	source: IDictionaryLookupSource;
	searchTerm: string;
}

const formatURL = ({ source, searchTerm }: ILookupSourceLinkProps): string =>
	source.source.replace('{}', searchTerm);

const LookupSourceLink: React.FC<ILookupSourceLinkProps> = ({
	source,
	searchTerm,
}) => {
	const url = formatURL({ source, searchTerm });
	return (
		<a target="_blank" rel="noopener noreferrer" href={url}>
			{source.name}
		</a>
	);
};

export default LookupSourceLink;
export { formatURL };
