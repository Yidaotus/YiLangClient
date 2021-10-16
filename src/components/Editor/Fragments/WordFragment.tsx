import { IDictionaryEntryResolved } from 'Document/Dictionary';
import { UUID } from 'Document/UUID';
import React, { CSSProperties } from 'react';
import { RenderElementProps } from 'slate-react';

const WordFragment: React.FC<{
	id: UUID;
	dictEntry: IDictionaryEntryResolved;
	renderProps: RenderElementProps;
}> = ({ id, dictEntry, renderProps }) => {
	let wordTagsWithColor = [];
	wordTagsWithColor = dictEntry.tags.filter((tag) => tag && tag.color);
	const numberOfTags = wordTagsWithColor?.length || 0;
	const lengthPerTag = 100 / numberOfTags;

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
	const gradiantStyle: CSSProperties = {
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
	// linear-gradient(left, rgba(237,128,52,1) 0%, rgba(237,128,52,1) 33%, rgba(254,177,35,1) 33%, rgba(254,177,35,1) 66%, rgba(33,132,205,1) 66%, rgba(33,132,205,1) 100%);

	const { spelling } = dictEntry;

	const { attributes, children } = renderProps;
	return (
		<span
			{...attributes}
			data-spelling={spelling}
			key={id}
			className={`word-fragment ${spelling && 'kanji'}`}
			style={{
				position: 'relative',
				cursor: 'default',
			}}
		>
			{children}
			{dictEntry.key}
			<div style={gradiantStyle} contentEditable={false} />
		</span>
	);
};

export default WordFragment;
