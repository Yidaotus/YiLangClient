import { Box, Typography } from '@mui/material';
import React from 'react';

export type SRSSentenceItem = { sentence: string; translation: string };

interface DictionarySentenceCardProps {
	item: SRSSentenceItem;
	side: 'Front' | 'Back';
}

const DictionarySentenceCard: React.FC<DictionarySentenceCardProps> = ({
	item,
	side,
}) => {
	let cardFace = null;
	switch (side) {
		case 'Front':
			cardFace = (
				<Box>
					<Typography variant="h6" component="div">
						{item.sentence}
					</Typography>
				</Box>
			);
			break;
		case 'Back':
			cardFace = (
				<Typography variant="h6" component="div">
					{item.translation}
				</Typography>
			);
			break;
	}

	return <Box>{cardFace}</Box>;
};

export default DictionarySentenceCard;
