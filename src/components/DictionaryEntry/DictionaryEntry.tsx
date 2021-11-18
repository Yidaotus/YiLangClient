/* eslint-disable react/destructuring-assignment */
import './DictionaryEntry.css';
import React from 'react';
import { IGrammarPoint, IDictionaryTag } from 'Document/Dictionary';
import { useHistory } from 'react-router';
import { useDictionaryEntryResolved } from '@hooks/DictionaryQueryHooks';
import { Button, Spinner, Tag } from '@blueprintjs/core';
import { Popover2 } from '@blueprintjs/popover2';

type IDictEntryProps = {
	entryId: string;
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
				<GrammarPoint point={tag.grammarPoint} color={tag.color} />
			}
			interactionKind="click"
			className="clickable-tag"
			placement="bottom"
		>
			{tagItem}
		</Popover2>
	) : (
		tagItem
	);
};

const DictionaryEntry: React.FC<IDictEntryProps> = (props) => {
	const { entryId, canLink } = props;
	const [loading, entryResolved] = useDictionaryEntryResolved(entryId);
	const history = useHistory();

	return (
		<>
			{entryResolved && (
				<div className="dictentry-panel">
					<div className="dictentry-head">
						{canLink ? (
							<h1 className="dictentry-head-item">
								<Button
									minimal
									onClick={() => {
										history.push(
											`/home/dictionary/${entryResolved.id}`
										);
									}}
								>
									{entryResolved.key}
								</Button>
								{entryResolved.spelling && (
									<span>{entryResolved.spelling}</span>
								)}
							</h1>
						) : (
							<h1 className="dictentry-head-item">
								{entryResolved.key}
								{entryResolved.spelling && (
									<span>{entryResolved.spelling}</span>
								)}
							</h1>
						)}
					</div>
					<blockquote>{entryResolved.comment}</blockquote>
					<p>{entryResolved.translations.join(', ')}</p>
					<ul>
						{entryResolved.tags.map((tag) => (
							<li key={tag.id} className="tag-node">
								<EntryTag tag={tag} />
							</li>
						))}
					</ul>
				</div>
			)}
			{loading && <Spinner />}
			{!loading && !entryResolved && <span>ERROR</span>}
		</>
	);
};

export default DictionaryEntry;
