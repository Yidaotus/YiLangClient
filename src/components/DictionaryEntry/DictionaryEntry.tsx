import './DictionaryEntry.css';
import React from 'react';
import {
	IDictionaryEntryResolved,
	IDictionaryTag,
	IGrammarPoint,
} from 'Document/Dictionary';
import { useNavigate } from 'react-router';
import { Button, Tag } from '@blueprintjs/core';
import { Popover2 } from '@blueprintjs/popover2';

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
	const tagItem = (
		<Tag
			icon={tag.grammarPoint && 'info-sign'}
			style={{ backgroundColor: tag.color || 'blue', marginLeft: '5px' }}
			key={tag.name}
		>
			{tag.name}
		</Tag>
	);
	return tag.grammarPoint ? (
		<Popover2
			content={
				<div style={{ padding: '10px' }}>
					<GrammarPoint point={tag.grammarPoint} color={tag.color} />
				</div>
			}
			interactionKind="click"
			className="clickable-tag pt-popover-content-sizing"
			portalClassName="popover-class"
			placement="bottom"
		>
			{tagItem}
		</Popover2>
	) : (
		tagItem
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
									minimal
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
