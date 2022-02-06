import { useDictionarySentence } from '@hooks/DictionaryQueryHooks';
import { Box, CircularProgress, Typography } from '@mui/material';
import { DictionarySentenceID } from 'Document/Utility';
import React from 'react';

export type SRSSentenceItem = { sentence: string; translation: string };

interface DictionarySentenceCardProps {
	item: DictionarySentenceID;
	side: 'Front' | 'Back';
}

const DictionarySentenceCard: React.FC<DictionarySentenceCardProps> = ({
	item,
	side,
}) => {
	let cardFace = null;
	const [loading, sentence] = useDictionarySentence(item);

	if (sentence) {
		switch (side) {
			case 'Front':
				cardFace = (
					<Box>
						<Typography variant="h6" component="div">
							{sentence.content}
						</Typography>
					</Box>
				);
				break;
			case 'Back':
				cardFace = (
					<Typography variant="h6" component="div">
						{sentence.translation}
					</Typography>
				);
				break;
		}
	}

	return (
		<Box>
			{loading && <CircularProgress />}
			{cardFace}
		</Box>
	);
};

export default DictionarySentenceCard;
