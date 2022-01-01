import './DictPopup.css';
import React from 'react';
import DictionaryEntry from '@components/DictionaryEntry/DictionaryEntry';
import { IDictionaryEntryResolved } from 'Document/Dictionary';
import { Box, List, Divider, ListItem, ListItemText } from '@mui/material';

export interface IDictPopupProps {
	entry: IDictionaryEntryResolved;
}

const DictPopup: React.FC<IDictPopupProps> = ({ entry }) => (
	<Box sx={{ p: 1 }}>
		{entry && <DictionaryEntry entry={entry} />}
		{entry.roots.length > 0 && (
			<>
				<Divider />
				<List dense>
					<ListItem>
						<ListItemText
							primary={entry.key}
							secondary={entry.translations.join(', ')}
						/>
					</ListItem>
				</List>
			</>
		)}
	</Box>
);

export default DictPopup;
