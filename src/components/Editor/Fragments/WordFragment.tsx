import './WordFragment.css';
import { useDictionaryEntryResolved } from '@hooks/DictionaryQueryHooks';
import { Spin } from 'antd';
import React, { CSSProperties } from 'react';
import { RenderElementProps, useSelected } from 'slate-react';
import { WordElement } from '../CustomEditor';

export type IWordFragmentData = Omit<RenderElementProps, 'element'> & {
	element: WordElement;
};

const WordFragment: React.FC<IWordFragmentData> = ({
	attributes,
	element,
	children,
}) => {
	const selected = useSelected();
	const [loadingEntry, dictEntry] = useDictionaryEntryResolved(
		element.dictId
	);

	let gradiantStyle: CSSProperties = {
		background: 'black',
		borderRadius: '10px',
		width: '100%',
		right: '0px',
		bottom: '0px',
		height: '2px',
		position: 'absolute',
	};

	if (dictEntry) {
		let wordTagsWithColor = [];
		wordTagsWithColor = dictEntry.tags.filter((tag) => tag && tag.color);
		const numberOfTags = wordTagsWithColor?.length || 0;
		const lengthPerTag = 100 / (numberOfTags || 1);

		const defaultTagColor = '#aabbcc';
		const defaultGradiant = [
			`${defaultTagColor} 0%`,
			`${defaultTagColor} 100%`,
		];

		const gradiants =
			numberOfTags > 0
				? wordTagsWithColor?.reduce<Array<string>>(
						(reducer, tag, index) => {
							const gradiantParam1 = `${tag.color} ${
								index * lengthPerTag
							}%`;
							const gradiantParam2 = `${tag.color} ${
								(index + 1) * lengthPerTag
							}%`;
							reducer.push(gradiantParam1);
							reducer.push(gradiantParam2);
							return reducer;
						},
						[]
				  )
				: defaultGradiant;
		gradiantStyle = {
			background: `linear-gradient(to right, ${gradiants?.map(
				(gradiant) => `${gradiant}`
			)})`,
			borderRadius: '10px',
			width: '100%',
			right: '0px',
			bottom: '0px',
			height: '2px',
			position: 'absolute',
		};
	}

	return (
		<span {...attributes} contentEditable={false}>
			{children}
			<span contentEditable={false}>
				<Spin wrapperClassName="inline-block" spinning={loadingEntry}>
					{dictEntry && (
						<span
							data-spelling={dictEntry.spelling}
							key={dictEntry.id}
							className={`word-fragment ${
								dictEntry.spelling && 'kanji'
							}`}
							style={{
								position: 'relative',
								cursor: 'default',
								borderRadius: '2px',
								backgroundColor: selected ? '#d4ecff' : '',
							}}
						>
							{dictEntry.key}
							<span style={gradiantStyle} />
						</span>
					)}
					{!dictEntry && (
						<span
							style={{
								position: 'relative',
								cursor: 'default',
							}}
						>
							{element.children.map((elem) => elem.text).join('')}
						</span>
					)}
				</Spin>
			</span>
		</span>
	);
};

export default React.memo(WordFragment);
