import React from 'react';
import { IGrammarPoint, IDictionaryTag } from 'Document/Dictionary';
import { useDictionaryEntryResolved } from '@hooks/DictionaryQueryHooks';
import { Editor, Path, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { useNavigate } from 'react-router';
import { Book as BookIcon, Link as LinkIcon } from '@mui/icons-material';
import {
	IconButton,
	Chip,
	CircularProgress,
	TableCell,
	TableRow,
	Stack,
} from '@mui/material';

type IDictEntryRowProps = {
	editor: Editor;
	path: Path;
	entryId: string;
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
	editor,
}) => {
	const [loading, entry] = useDictionaryEntryResolved(entryId);
	const navigate = useNavigate();

	return entry ? (
		<TableRow
			key={entry.key}
			sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
		>
			<TableCell component="th" scope="row">
				{entry.key}
			</TableCell>
			<TableCell align="right">{entry.spelling}</TableCell>
			<TableCell align="right">{entry.translations.join(', ')}</TableCell>
			<TableCell align="right">
				<Stack spacing={1} direction="row">
					{entry.tags.map((tag) => (
						<EntryTag tag={tag} key={tag.id} />
					))}
				</Stack>
			</TableCell>
			<TableCell align="right">
				<IconButton
					onMouseUp={() => {
						navigate(`/home/dictionary/${entry.id}`);
					}}
				>
					<BookIcon />
				</IconButton>
			</TableCell>
			<TableCell align="right">
				<IconButton
					onMouseUp={(e) => {
						setTimeout(() => {
							Transforms.select(editor, path);
							if (editor.selection) {
								const domNode = ReactEditor.toDOMRange(
									editor,
									editor.selection
								);
								domNode.commonAncestorContainer.parentElement?.scrollIntoView(
									{
										behavior: 'smooth',
										block: 'center',
									}
								);
							}
						});
						e.preventDefault();
					}}
				>
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

export default DictionaryEntryRow;
