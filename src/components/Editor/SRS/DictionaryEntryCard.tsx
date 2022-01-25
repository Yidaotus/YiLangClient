import { useDictionaryEntryResolved } from '@hooks/DictionaryQueryHooks';
import { Box, CircularProgress, Typography } from '@mui/material';
import { DictionaryEntryID } from 'Document/Utility';
import React from 'react';

interface DictionaryEntryCardProps {
	item: DictionaryEntryID;
	side: 'Front' | 'Back';
}

const DictionaryEntryCard: React.FC<DictionaryEntryCardProps> = ({
	item,
	side,
}) => {
	const [loadingEntry, entry] = useDictionaryEntryResolved(item);

	let cardFace = null;
	if (entry) {
		switch (side) {
			case 'Front':
				cardFace = (
					<Box>
						{entry.spelling && (
							<Typography
								variant="caption"
								component="div"
								textAlign="center"
							>
								{entry.spelling}
							</Typography>
						)}
						<Typography variant="h4" component="div">
							{entry.key}
						</Typography>
					</Box>
				);
				break;
			case 'Back':
				cardFace = (
					<Typography variant="h5" component="div">
						{entry.translations.join(', ')}
					</Typography>
				);
				break;
		}
	}

	return (
		<Box>
			{loadingEntry && <CircularProgress />}
			{cardFace}
		</Box>
	);
};

export default DictionaryEntryCard;
