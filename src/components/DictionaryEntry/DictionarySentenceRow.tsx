import React from 'react';
import { useDictionarySentence } from '@hooks/DictionaryQueryHooks';
import { Path } from 'slate';
import { useNavigate } from 'react-router';
import { Link as LinkIcon } from '@mui/icons-material';
import {
	IconButton,
	CircularProgress,
	TableCell,
	TableRow,
	Typography,
} from '@mui/material';
import { DictionarySentenceID } from 'Document/Utility';

type IDictionarySentenceRowProps = {
	path: Path;
	id: DictionarySentenceID;
	scrollToPath: (path: Path) => void;
};

const DictionarySentenceRow: React.FC<IDictionarySentenceRowProps> = ({
	id,
	path,
	scrollToPath,
}) => {
	const [loading, sentence] = useDictionarySentence(id);

	return sentence ? (
		<TableRow
			key={sentence.id}
			sx={{
				'&:last-child td, &:last-child th': { border: 0 },
			}}
		>
			<TableCell scope="row">
				<Typography>{sentence.content}</Typography>
				<Typography>{sentence.translation}</Typography>
			</TableCell>
			<TableCell scope="row">
				<IconButton size="small" onMouseUp={() => scrollToPath(path)}>
					<LinkIcon />
				</IconButton>
			</TableCell>
		</TableRow>
	) : (
		<TableRow>
			<TableCell>
				{loading && <CircularProgress />}
				{!loading && !sentence && <span>ERROR</span>}
			</TableCell>
		</TableRow>
	);
};

export default React.memo(DictionarySentenceRow);
