import './DictionaryEntry.css';
import React, { useState } from 'react';
import {
	IDictionaryEntryResolved,
	IDictionaryTag,
	IGrammarPoint,
} from 'Document/Dictionary';
import { useNavigate } from 'react-router';
import { Button, Chip, Popover } from '@mui/material';
import { Info as InfoIcon } from '@mui/icons-material';

type IDictEntryProps = {
	entry: IDictionaryEntryResolved;
	canLink?: boolean;
};

export const GrammarPoint: React.FC<{ point: IGrammarPoint; color?: string }> =
	({ point, color }) => {
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

const EntryTag: React.FC<{ tag: IDictionaryTag }> = ({ tag }) => {
	const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
	const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		setAnchorEl(event.currentTarget);
	};
	const handleClose = () => {
		setAnchorEl(null);
	};

	const open = Boolean(anchorEl);
	const id = open ? 'simple-popover' : undefined;
	return tag.grammarPoint ? (
		<>
			<Button
				aria-describedby={id}
				variant="contained"
				onClick={handleClick}
			>
				{tag.name}
			</Button>
			<Popover
				id={id}
				open={open}
				anchorEl={anchorEl}
				onClose={handleClose}
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'left',
				}}
			>
				<GrammarPoint point={tag.grammarPoint} color={tag.color} />
			</Popover>
		</>
	) : (
		<Chip
			style={{
				backgroundColor: tag.color || 'blue',
				marginLeft: '5px',
			}}
			key={tag.name}
			label={tag.name}
		/>
	);
};

const DictionaryEntry: React.FC<IDictEntryProps> = (props) => {
	const { entry, canLink } = props;
	const navigate = useNavigate();

	return (
		<>
			{entry && (
				<div className="dictentry-panel">
					<div className="dictentry-head">
						{canLink ? (
							<h1 className="dictentry-head-item">
								<Button
									onClick={() => {
										navigate(
											`/home/dictionary/${entry.id}`
										);
									}}
								>
									{entry.key}
								</Button>
								{entry.spelling && (
									<span>{entry.spelling}</span>
								)}
							</h1>
						) : (
							<h1 className="dictentry-head-item">
								{entry.key}
								{entry.spelling && (
									<span>{entry.spelling}</span>
								)}
							</h1>
						)}
					</div>
					<blockquote>{entry.comment}</blockquote>
					<p>{entry.translations.join(', ')}</p>
					<ul>
						{entry.tags.map((tag) => (
							<li key={tag.id} className="tag-node">
								<EntryTag tag={tag} />
							</li>
						))}
					</ul>
				</div>
			)}
		</>
	);
};

export default DictionaryEntry;
