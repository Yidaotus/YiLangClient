/* eslint-disable react/destructuring-assignment */
import './DictionaryEntry.css';
import React from 'react';
import { Popover, Tag, Button } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import {
	IGrammarPoint,
	IDictionaryTag,
	IDictionaryEntryResolved,
} from 'Document/Dictionary';
import { useHistory } from 'react-router';

type IDictEntryProps = {
	dictEntry: IDictionaryEntryResolved;
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
			icon={tag.grammarPoint && <ExclamationCircleOutlined />}
			color={tag.color || 'blue'}
			key={tag.name}
		>
			{tag.name}
		</Tag>
	);
	return tag.grammarPoint ? (
		<Popover
			content={
				<GrammarPoint point={tag.grammarPoint} color={tag.color} />
			}
			trigger="click"
			className="clickable-tag"
			placement="bottom"
		>
			{tagItem}
		</Popover>
	) : (
		tagItem
	);
};

const DictEntry: React.FC<IDictEntryProps> = (props) => {
	const { dictEntry, canLink } = props;
	const { key, spelling, comment, translations, tags, id } = dictEntry;
	const history = useHistory();

	return (
		<div className="dictentry-panel">
			<div className="dictentry-head">
				{canLink ? (
					<h1 className="dictentry-head-item">
						<Button
							type="link"
							size="large"
							onClick={() => {
								history.push(`/home/dictionary/${id}`);
							}}
						>
							{key}
						</Button>
						{spelling && <span>{spelling}</span>}
					</h1>
				) : (
					<h1 className="dictentry-head-item">
						{key}
						{spelling && <span>{spelling}</span>}
					</h1>
				)}
			</div>
			<blockquote>{comment}</blockquote>
			<p>{translations.join(', ')}</p>
			<ul>
				{tags.map((tag) => (
					<li key={tag.id} className="tag-node">
						<EntryTag tag={tag} />
					</li>
				))}
			</ul>
		</div>
	);
};

export default DictEntry;
