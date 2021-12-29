import './WordFragment.css';
import { useDictionaryEntryResolved } from '@hooks/DictionaryQueryHooks';
import React, { CSSProperties } from 'react';
import { RenderElementProps, useSelected } from 'slate-react';
import { WordElement } from '@components/Editor/YiEditor';
import { CircularProgress } from '@mui/material';

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
		<div
			style={{
				position: 'relative',
				display: 'inline-flex',
				alignItems: 'baseline',
				color: loadingEntry ? 'lightgray' : 'black',
			}}
			{...attributes}
		>
			{children}
			{loadingEntry && <CircularProgress />}
			<span contentEditable={false}>
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
			</span>
		</div>
	);
};

export default React.memo(WordFragment);
