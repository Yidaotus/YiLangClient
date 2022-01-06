import './DictionaryEntry.css';
import React from 'react';
import {
	IDictionaryEntryResolved,
	IDictionaryTag,
	IGrammarPoint,
} from 'Document/Dictionary';
import { useNavigate } from 'react-router';
import { Box, Chip, Link, Stack, Typography } from '@mui/material';

type IDictEntryProps = {
	entry: IDictionaryEntryResolved;
	canLink?: boolean;
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
		style={{
			backgroundColor: tag.color || 'blue',
		}}
		key={tag.name}
		label={
			<Typography
				variant="button"
				sx={{ fontSize: '0.9em', color: 'white' }}
			>
				{tag.name}
			</Typography>
		}
	/>
);

const DictionaryEntry: React.FC<IDictEntryProps> = ({ entry }) => {
	const navigate = useNavigate();

	return (
		<Box
			sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' } }}
		>
			<Box sx={{ display: 'flex', flexDirection: 'column', p: 2 }}>
				<Typography variant="subtitle2" component="div">
					{entry.spelling}
				</Typography>
				<Typography variant="h5" gutterBottom component="div">
					{entry.key}
				</Typography>
				<Stack direction={{ xs: 'row', sm: 'column' }} spacing={1}>
					{entry.tags.map((tag) => (
						<EntryTag tag={tag} key={tag.id} />
					))}
				</Stack>
			</Box>
			<Box sx={{ display: 'flex', flexDirection: 'column', p: 2 }}>
				<Typography
					variant="caption"
					component="div"
					sx={{ color: 'gray' }}
				>
					Translations
				</Typography>
				<Typography variant="body1" gutterBottom component="div">
					{entry.translations.join(', ')}
				</Typography>
				{entry.comment && (
					<>
						<Typography
							variant="caption"
							component="div"
							sx={{ color: 'gray' }}
						>
							Comment
						</Typography>
						<Typography
							variant="body2"
							gutterBottom
							component="div"
						>
							{entry.comment}
						</Typography>
					</>
				)}
				{entry.roots.length > 0 && (
					<>
						<Typography
							variant="caption"
							component="div"
							sx={{ color: 'gray' }}
						>
							Root entries
						</Typography>
						<Stack>
							{entry.roots.map((root) => (
								<Box
									sx={{
										display: 'flex',
										flexDirection: 'row',
										alignItems: 'baseline',
									}}
								>
									<Link
										component="button"
										variant="body2"
										onClick={() => {
											navigate(
												`../dictionary/${root.id}`
											);
										}}
									>
										{root.key}
									</Link>
									<Typography
										variant="body2"
										gutterBottom
										component="div"
									>
										{` : ${root.translations.join(', ')}`}
									</Typography>
								</Box>
							))}
						</Stack>
					</>
				)}
			</Box>
		</Box>
	);
};

export default DictionaryEntry;
