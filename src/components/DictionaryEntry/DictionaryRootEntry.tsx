import './DictionaryEntry.css';
import React from 'react';
import { IDictionaryEntry } from 'Document/Dictionary';
import { useNavigate } from 'react-router';
import { Button, IconButton, ListItem, ListItemText } from '@mui/material';

type IDictEntryProps = {
	entry: IDictionaryEntry;
	canLink?: boolean;
};

const DictionaryRootEntry: React.FC<IDictEntryProps> = (props) => {
	const { entry, canLink } = props;
	const navigate = useNavigate();

	return (
		<ListItem>
			<ListItemText
				primary={entry.key}
				secondary={entry.translations.join(', ')}
			/>
		</ListItem>
	);
};

export default DictionaryRootEntry;
