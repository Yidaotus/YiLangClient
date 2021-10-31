import './DictionaryEntryRow.css';
import React from 'react';
import { Popover, Tag, Spin, Button } from 'antd';
import { ExclamationCircleOutlined, SendOutlined } from '@ant-design/icons';
import { IGrammarPoint, IDictionaryTag } from 'Document/Dictionary';
import { useDictionaryEntryResolved } from '@hooks/DictionaryQueryHooks';
import { Editor, Path, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';

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
			icon={tag.grammarPoint && <ExclamationCircleOutlined />}
			color={tag.color || 'blue'}
			key={tag.name}
			style={{ userSelect: 'none' }}
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

const DictionaryEntryRow: React.FC<IDictEntryRowProps> = (props) => {
	const { entryId, path, editor } = props;
	const [loading, entryResolved] = useDictionaryEntryResolved(entryId);

	return (
		<>
			{entryResolved && (
				<div className="dictentry-row">
					<span className="dictentry-col">
						{entryResolved.key}
						{entryResolved.spelling && (
							<span>({entryResolved.spelling})</span>
						)}
					</span>
					<span className="dictentry-col">
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
						icon={<SendOutlined />}
					/>
				</div>
			)}
			{loading && <Spin tip="Fetching Entry" />}
			{!loading && !entryResolved && <span>ERROR</span>}
		</>
	);
};

export default DictionaryEntryRow;
