import './DictionaryEntryRow.css';
import React from 'react';
import { IGrammarPoint, IDictionaryTag } from 'Document/Dictionary';
import { useDictionaryEntryResolved } from '@hooks/DictionaryQueryHooks';
import { Editor, Path, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { useNavigate } from 'react-router';
import { Book as BookIcon, Link as LinkIcon } from '@mui/icons-material';
import { IconButton, Chip, CircularProgress } from '@mui/material';

type IDictEntryRowProps = {
	editor: Editor;
	path: Path;
	entryId: string;
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
	const [loading, entryResolved] = useDictionaryEntryResolved(entryId);
	const navigate = useNavigate();

	return (
		<>
			{entryResolved && (
				<div className="dictentry-row">
					<span className="dictentry-col">
						{entryResolved.key}
						{entryResolved.spelling && (
							<span className="dictentry-spelling">
								{entryResolved.spelling}
							</span>
						)}
					</span>
					<span className="dictentry-col dictentry-comment">
						{entryResolved.comment}
					</span>
					<span className="dictentry-col">
						{entryResolved.translations.join(', ')}
					</span>
					<span className="dictentry-col">
						<ul>
							{entryResolved.tags.map((tag) => (
								<li key={tag.id} className="tag-node">
									<EntryTag tag={tag} />
								</li>
							))}
						</ul>
					</span>
					<IconButton
						onMouseUp={() => {
							navigate(`/home/dictionary/${entryResolved.id}`);
						}}
					>
						<BookIcon />
					</IconButton>
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
				</div>
			)}
			{loading && <CircularProgress />}
			{!loading && !entryResolved && <span>ERROR</span>}
		</>
	);
};

export default DictionaryEntryRow;
