import './DictionaryEntry.css';
import React from 'react';
import {
	IDictionaryEntryResolved,
	IDictionaryTag,
	IGrammarPoint,
} from 'Document/Dictionary';
import {
	Box,
	Chip,
	Link,
	Stack,
	SxProps,
	Theme,
	Typography,
} from '@mui/material';
import { DictionaryEntryID } from 'Document/Utility';
// eslint-disable-next-line import/no-extraneous-dependencies
import { ResponsiveStyleValue } from '@mui/system';

export type IDictionaryEntryProps = {
	entry: IDictionaryEntryResolved;
	canLink?: boolean;
	onRootSelect: (id: DictionaryEntryID) => void;
	size?: 'small' | 'large' | 'responsive';
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

const DictionaryEntry: React.FC<IDictionaryEntryProps> = ({
	entry,
	onRootSelect,
	size = 'responsive',
}) => {
	let rootDynamicSxProps: SxProps<Theme> = {
		flexDirection: {
			xs: 'column',
			sm: 'row',
		},
	};
	switch (size) {
		case 'small':
			rootDynamicSxProps = { flexDirection: 'column' };
			break;
		case 'large':
			rootDynamicSxProps = { flexDirection: 'row' };
			break;
	}

	let tagsDynamicSxProps: ResponsiveStyleValue<
		'row' | 'row-reverse' | 'column' | 'column-reverse'
	> = {
		xs: 'row',
		sm: 'column',
	};
	switch (size) {
		case 'small':
			tagsDynamicSxProps = 'row';
			break;
		case 'large':
			tagsDynamicSxProps = 'column';
			break;
	}

	return (
		<Box sx={{ ...rootDynamicSxProps, display: 'flex' }}>
			<Box
				sx={{
					display: 'flex',
					flexDirection: 'column',
					p: 1,
					flexShrink: 0,
				}}
			>
				<Typography variant="subtitle2" component="div">
					{entry.spelling}
				</Typography>
				<Typography variant="h5" gutterBottom component="div">
					{entry.key}
				</Typography>
				<Stack
					direction={tagsDynamicSxProps}
					spacing={1}
					sx={{ flexWrap: 'wrap' }}
				>
					{entry.tags.map((tag) => (
						<Box key={tag.id}>
							<EntryTag tag={tag} />
						</Box>
					))}
				</Stack>
			</Box>
			<Box sx={{ display: 'flex', flexDirection: 'column', p: 1 }}>
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
										wordBreak: 'break-word',
									}}
								>
									<Link
										component="button"
										variant="body2"
										onClick={() => {
											onRootSelect(root.id);
										}}
									>
										<Typography
											variant="body2"
											component="div"
										>
											{root.key}
										</Typography>
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
