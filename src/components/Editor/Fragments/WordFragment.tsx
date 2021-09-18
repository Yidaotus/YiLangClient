import { IDictionaryEntryResolved } from 'Document/Dictionary';
import { UUID } from 'Document/UUID';
import React, { CSSProperties } from 'react';
import FragmentElement from './FragmentElement';

const WordFragment: React.FC<{
	id: UUID;
	value: string;
	dictEntry: IDictionaryEntryResolved;
}> = ({ id, value, dictEntry }) => {
	let wordTagsWithColor = [];
	wordTagsWithColor = dictEntry.tags.filter((tag) => tag && tag.color);
	const numberOfTags = wordTagsWithColor?.length || 0;
	const lengthPerTag = 100 / numberOfTags;

	const defaultGradiant = '#aabbcc';
	const defaultGradiants = [
		`${defaultGradiant} 0%`,
		`${defaultGradiant} 100%`,
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
			: defaultGradiants;
	const gradiantStyle: CSSProperties = {
		background: `linear-gradient(to right, ${gradiants?.map(
			(gradiant) => `${gradiant}`
		)})`,
	};
	// linear-gradient(left, rgba(237,128,52,1) 0%, rgba(237,128,52,1) 33%, rgba(254,177,35,1) 33%, rgba(254,177,35,1) 66%, rgba(33,132,205,1) 66%, rgba(33,132,205,1) 100%);

	const { spelling } = dictEntry;
	const translation = dictEntry.translations.join(',');

	return (
		<span
			data-word={value}
			data-spelling={spelling}
			key={id}
			className={`word-fragment ${spelling && 'kanji'}`}
		>
			<FragmentElement
				className="word-fragment"
				id={id}
				data-translation={translation}
			>
				{value}
				<div
					className="word-fragment-tag-indicator"
					style={gradiantStyle}
				/>
			</FragmentElement>
		</span>
	);
};

export default WordFragment;
