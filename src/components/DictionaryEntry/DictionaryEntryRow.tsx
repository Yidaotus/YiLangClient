import './DictionaryEntryRow.css';
import React from 'react';
import { IGrammarPoint, IDictionaryTag } from 'Document/Dictionary';
import { useDictionaryEntryResolved } from '@hooks/DictionaryQueryHooks';
import { Editor, Path, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { useNavigate } from 'react-router';
import { Button, Spinner, Tag } from '@blueprintjs/core';
import { Popover2 } from '@blueprintjs/popover2';

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

const EntryTag: React.FC<{ tag: IDictionaryTag }> = ({ tag }) => {
	const tagItem = (
		<Tag
			icon={tag.grammarPoint && 'info-sign'}
			color={tag.color || 'blue'}
			key={tag.name}
			style={{
				userSelect: 'none',
				backgroundColor: tag.color,
				color: '#333333',
			}}
		>
			{tag.name}
		</Tag>
	);
	return tag.grammarPoint ? (
		<Popover2
			content={
				<GrammarPoint point={tag.grammarPoint} color={tag.color} />
			}
			className="clickable-tag"
			placement="bottom"
		>
			{tagItem}
		</Popover2>
	) : (
		tagItem
	);
};

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
					<Button
						className="dictentry-col"
						style={{ width: '25px' }}
						minimal
						onMouseUp={() => {
							navigate(`/home/dictionary/${entryResolved.id}`);
						}}
						icon="book"
					/>
					<Button
						className="dictentry-col"
						style={{ width: '25px' }}
						minimal
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
						icon="link"
					/>
				</div>
			)}
			{loading && <Spinner />}
			{!loading && !entryResolved && <span>ERROR</span>}
		</>
	);
};

export default DictionaryEntryRow;
