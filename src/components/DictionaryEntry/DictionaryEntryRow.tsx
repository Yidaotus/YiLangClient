import React from 'react';
import { IGrammarPoint, IDictionaryTag } from 'Document/Dictionary';
import { useDictionaryEntryResolved } from '@hooks/DictionaryQueryHooks';
import { Path } from 'slate';
import { useNavigate } from 'react-router';
import { Link as LinkIcon, MenuBookOutlined } from '@mui/icons-material';
import {
	IconButton,
	Chip,
	CircularProgress,
	TableCell,
	TableRow,
	Stack,
	Box,
	Typography,
} from '@mui/material';

type IDictEntryRowProps = {
	path: Path;
	entryId: string;
	scrollToPath: (path: Path) => void;
};

export const GrammarPoint: React.FC<{
	point: IGrammarPoint;
	color?: string;
}> = ({ point, color }) => {
	const highlightColor = color || '#91d5ff';
	return (
		<div className="grammar-container">
			<h1 style={{ color: highlightColor }}>{point.name}</h1>
			<blockquote>{point.description}</blockquote>
			<ul>
				{point.construction.map((c, i) => (
					// eslint-disable-next-line react/no-array-index-key
					<li key={i}>{c}</li>
				))}
			</ul>
		</div>
	);
};

const EntryTag: React.FC<{ tag: IDictionaryTag }> = ({ tag }) => (
	<Chip
		key={tag.name}
		style={{
			backgroundColor: tag.color,
			color: '#333333',
		}}
		label={tag.name}
	/>
);

const DictionaryEntryRow: React.FC<IDictEntryRowProps> = ({
	entryId,
	path,
	scrollToPath,
}) => {
	const [loading, entry] = useDictionaryEntryResolved(entryId);
	const navigate = useNavigate();

	return entry ? (
		<TableRow
			key={entry.key}
			sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
		>
			<TableCell component="th" scope="row">
				<Typography
					component="span"
					sx={{
						fontWeight: '500',
					}}
				>
					{entry.key}
				</Typography>
				{entry.spelling && (
					<Typography
						variant="caption"
						component="span"
						sx={{
							marginLeft: 1,
						}}
					>
						({entry.spelling})
					</Typography>
				)}
			</TableCell>
			<TableCell align="left">{entry.translations.join(', ')}</TableCell>
			<TableCell
				align="right"
				sx={{
					width: '110px',
					overflow: 'hidden',
				}}
			>
				<Box
					sx={{
						position: 'relative',
					}}
				>
					{entry.tags.map((tag, i) => (
						<Box
							sx={{
								position: 'absolute',
								left: i * 10,
								top: -10,
							}}
						>
							<EntryTag tag={tag} key={tag.id} />
						</Box>
					))}
				</Box>
			</TableCell>
			<TableCell align="right" width={1}>
				<IconButton
					onMouseUp={() => {
						navigate(`/home/dictionary/${entry.id}`);
					}}
				>
					<MenuBookOutlined />
				</IconButton>
			</TableCell>
			<TableCell align="right" width={1}>
				<IconButton onMouseUp={() => scrollToPath(path)}>
					<LinkIcon />
				</IconButton>
			</TableCell>
		</TableRow>
	) : (
		<>
			{loading && <CircularProgress />}
			{!loading && !entry && <span>ERROR</span>}
		</>
	);
};

export default React.memo(DictionaryEntryRow);
