import React from 'react';
import { FILLERFRAGMENTTYPEID, Fragment } from 'Document/Fragment';
import { StoreMap } from 'store';
import { Popover } from 'antd';
import { IDictionaryEntry, IDictionaryTag } from 'Document/Dictionary';
import { notUndefined } from 'Document/Utility';
import MarkFragment from './MarkFragment';
import WordFragment from './WordFragment';
import SentenceFragment from './SentenceFragment';
import FragmentElement from './FragmentElement';

const assertNever = (x: never): never => {
	throw new Error(`Unexpected object: ${x}`);
};

export type FragmentRenderFunction<T> = ({
	root,
	fragments,
	id,
	renderCallback,
	renderData,
}: {
	root: string;
	fragments: Fragment[];
	id: string;
	offset?: number;
	renderCallback: RenderCallback<T>;
	renderData: T;
}) => JSX.Element[];

/**
 * Return a single JSX Element with every fragment in provided array. Every fragment is rendered according to the provided
 * callback function.
 * @param root The root string which provided fragments are relative to
 * @param fragments Array of fragments to render
 * @param id id for the parent element. If none is provided a random uuid is generated.
 * @param renderCallback a callback which is called for every fragment to render its content.
 */
function renderFragments<T>({
	root,
	fragments,
	id,
	renderCallback,
	renderData,
}: {
	root: string;
	fragments: Fragment[];
	id: string;
	offset?: number;
	renderCallback: RenderCallback<T>;
	renderData: T;
}): JSX.Element[] {
	const output = new Array<JSX.Element>();

	let position = 0;
	const sortedFragments = [...fragments].sort(
		(a, b) => a.range.start - b.range.start
	);

	for (const fragment of sortedFragments) {
		// Skip malformed and/or doubled fragments
		if (position > fragment.range.start) {
			break;
		}

		if (position < fragment.range.start) {
			const front = [position, fragment.range.start];
			output.push(
				<span
					key={`${fragment.id}_front`}
					data-id={`${fragment.id}_front`}
					data-type={FILLERFRAGMENTTYPEID}
				>
					{root.substring(front[0], front[1])}
				</span>
			);
		}
		const middle = [fragment.range.start, fragment.range.end];
		const subroot = root.substring(middle[0], middle[1]);
		const newFragment = renderCallback({
			subroot,
			fragment,
			renderData,
		});
		output.push(newFragment);

		position = fragment.range.end;
	}

	if (position < root.length) {
		const end = [position, root.length];
		const subroot = root.substring(end[0], end[1]);
		output.push(
			<span
				key={`${id}_last`}
				data-id={`${id}_last`}
				data-type={FILLERFRAGMENTTYPEID}
			>
				{subroot}
			</span>
		);
	}

	return output;
}

const DefaultRenderer: RenderCallback<{
	userDictionary: Array<IDictionaryEntry>;
	userTags: StoreMap<IDictionaryTag>;
}> = ({ subroot, fragment, renderData }) => {
	// Hooks can only be used in components. Since this is not a component
	// react things we are still in <FragmentedString> and detects the newly
	// called hook as different from the render before.
	// const userDictionary = useContext(DictionaryContext);
	const { userDictionary, userTags } = renderData;

	switch (fragment.type) {
		case 'Mark':
			return (
				<MarkFragment {...fragment} value={subroot} key={fragment.id} />
			);
		case 'Sentence': {
			return (
				<SentenceFragment
					{...fragment}
					value={subroot}
					userDictionary={userDictionary}
					userTags={userTags}
					renderer={renderFragments}
					defaultRenderer={DefaultRenderer}
					key={fragment.id}
				/>
			);
		}
		case 'Word': {
			const dictEntry = userDictionary.find(
				(entry) => entry.id === fragment.data.dictId
			);
			const entryTags = dictEntry?.tags
				.map((id) => userTags[id])
				.filter(notUndefined);
			if (!dictEntry || !entryTags) {
				return <span key={fragment.data.dictId}>{subroot} </span>;
			}
			const resolvedDictEntry = {
				...dictEntry,
				root: undefined,
				tags: entryTags,
			};
			return (
				<WordFragment
					{...fragment}
					dictEntry={resolvedDictEntry}
					value={subroot}
					key={fragment.id}
				/>
			);
		}
		case 'Note':
			return (
				<Popover
					content={fragment.data.note}
					trigger="hover"
					key={fragment.id}
				>
					<FragmentElement id={fragment.id}>
						{subroot}
					</FragmentElement>
				</Popover>
			);
		case 'Highlight':
			return (
				<FragmentElement
					className="highlight-fragment"
					id={fragment.id}
					key={fragment.id}
				>
					{subroot}
				</FragmentElement>
			);
		case 'Background':
			return (
				<FragmentElement
					className="background-fragment"
					id={fragment.id}
					key={fragment.id}
				>
					{subroot}
				</FragmentElement>
			);
		default:
			return assertNever(fragment);
	}
};

/**
 * Render callback which takes the fragment and subroot and returns the rendered fragment.
 * @callback renderCallback
 * @param {Objectl} params
 * @param {string} params.subroot the subroot extracted from the original root to render inside the fragment
 * @param {ITextFragment & T} params.fragment the fragment to render
 * @returns {JSX.Element} the rendered element
 */

export type RenderCallback<T> = ({
	subroot,
	fragment,
	renderData,
}: {
	subroot: string;
	fragment: Fragment;
	renderData: T;
}) => JSX.Element;

export { renderFragments, DefaultRenderer };
