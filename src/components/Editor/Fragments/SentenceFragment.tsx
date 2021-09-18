import { IDictionaryEntry, IDictionaryTag } from 'Document/Dictionary';
import { ISentenceFragmentData, ResolvedFragment } from 'Document/Fragment';
import React from 'react';
import { StoreMap } from 'store';
import FragmentElement from './FragmentElement';
import type {
	FragmentRenderFunction,
	RenderCallback,
} from './FragmentRenderer';

interface ISentenceRenderData {
	userDictionary: Array<IDictionaryEntry>;
	userTags: StoreMap<IDictionaryTag>;
}

const SentenceFragment: React.FC<
	ResolvedFragment<ISentenceFragmentData> &
		ISentenceRenderData & {
			renderer: FragmentRenderFunction<ISentenceRenderData>;
			defaultRenderer: RenderCallback<ISentenceRenderData>;
		}
> = ({
	id,
	value,
	data,
	userTags,
	userDictionary,
	renderer,
	defaultRenderer,
}) => {
	const { words } = data;
	return (
		<FragmentElement className="sentence-fragment" id={id} key={id}>
			{renderer({
				root: value,
				id,
				fragments: words,
				renderCallback: defaultRenderer,
				renderData: {
					userDictionary,
					userTags,
				},
			})}
		</FragmentElement>
	);
};

export default SentenceFragment;
