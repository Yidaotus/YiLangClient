import React, { useMemo } from 'react';
import { getUUID, UUID } from 'Document/UUID';

import './FragmentedString.css';
import {
	FRAGMENTABLETYPEID,
	isFragmentType,
	Fragment,
	IFragmentableString,
} from 'Document/Fragment';

import { useSelector } from 'react-redux';
import { IRootState } from '@store/index';
import { selectDictionaryEntries } from '@store/dictionary/selectors';
import {
	DefaultRenderer,
	RenderCallback,
	renderFragments,
} from './FragmentRenderer';

/**
 * Enforce custom renderData if a custom renderer is used
 */
export type IFragmentedStringProps<T> =
	| {
			fragmentable: IFragmentableString;
			customRenderer: RenderCallback<T>;
			renderData?: T;
	  }
	| {
			fragmentable: IFragmentableString;
			customRenderer?: undefined;
			renderData?: undefined;
	  };

/**
 * Render the provided FragmentableString and all it's fragment according to an internal FragmentRenderer.
 * @param id the data-id property of the returned parent DOM element
 * @param fragmentString the fragmentable string to render
 * @returns JSX.Element the rendered dom element
 */
function FragmentedString<T>({
	fragmentable,
	customRenderer,
	renderData,
}: IFragmentedStringProps<T>): JSX.Element {
	const { root, fragments } = fragmentable;
	let fragmentsToRender: Fragment[] = [];

	const fragmentIds = useMemo(() => {
		const wordIds = fragments
			.filter(isFragmentType('Word'))
			.map((f) => f.data.dictId);
		const sentenceWordIds = fragments
			.filter(isFragmentType('Sentence'))
			.reduce(
				(accu, s) => [
					...accu,
					...s.data.words.map((w) => w.data.dictId),
				],
				new Array<UUID>()
			);
		return [...wordIds, ...sentenceWordIds];
	}, [fragments]);

	const getDictionaryEntries = useMemo(selectDictionaryEntries, []);

	const userDictionary = useSelector((state: IRootState) =>
		getDictionaryEntries(state, fragmentIds)
	);

	const userTags = useSelector((state: IRootState) => state.dictionary.tags);

	if (fragmentable.highlightedFragment) {
		const highlightedFragment = fragments.find(
			(f) => f.id === fragmentable.highlightedFragment
		);
		if (highlightedFragment) {
			fragmentsToRender.push({
				id: getUUID(),
				type: 'Highlight',
				range: highlightedFragment.range,
				data: { type: 'Highlight' },
			});
			fragmentsToRender.push({
				id: getUUID(),
				type: 'Background',
				range: { start: 0, end: highlightedFragment.range.start },
				data: { type: 'Background' },
			});
			fragmentsToRender.push({
				id: getUUID(),
				type: 'Background',
				range: {
					start: highlightedFragment.range.end,
					end: fragmentable.root.length,
				},
				data: { type: 'Background' },
			});
		}
	} else {
		fragmentsToRender = fragments;
	}

	const hasSentenceSpellingFragments = fragments
		.filter(isFragmentType('Sentence'))
		.find((sentenceFrag) =>
			sentenceFrag.data.words.find((word) => {
				const dEntry = userDictionary.find(
					(entry) => entry?.id === word.data.dictId
				);
				return dEntry?.spelling;
			})
		);
	const hasWordSpellingFragments = fragments
		.filter(isFragmentType('Word'))
		.find((word) => {
			const dEntry = userDictionary.find(
				(entry) => entry?.id === word.data.dictId
			);
			return dEntry?.spelling;
		});

	const hasSpellingFragments =
		hasSentenceSpellingFragments || hasWordSpellingFragments;

	try {
		const renderedFragments =
			customRenderer && renderData
				? renderFragments({
						root,
						id: fragmentable.id,
						fragments: fragmentsToRender,
						renderCallback: customRenderer,
						renderData,
				  })
				: renderFragments({
						root,
						id: fragmentable.id,
						fragments: fragmentsToRender,
						renderCallback: DefaultRenderer,
						renderData: { userDictionary, userTags },
				  });

		return (
			<span
				data-type={FRAGMENTABLETYPEID}
				data-id={fragmentable.id}
				className={`${
					fragmentable.highlightedFragment ? 'non-selectable' : ''
				} ${
					fragmentable.showSpelling && hasSpellingFragments
						? 'show-spelling'
						: ''
				}`}
			>
				{renderedFragments}
			</span>
		);
	} catch (e) {
		return <span>{`Error parsing Fragmented String ${e}`}</span>;
	}
}

export default FragmentedString;
