import React, { useMemo } from 'react';
import { DocumentBlockNormalized } from 'store/editor/types';
import { useSelector } from 'react-redux';
import { IRootState } from 'store';
import { UUID } from 'Document/UUID';
import {
	selectFragmentablesById,
	selectFragmentsById,
} from '@store/dictionary/selectors';
import { blockRenderers } from './Elements';

export interface IBlockProps {
	block: DocumentBlockNormalized;
}

const Block: React.FC<IBlockProps> = ({ block }) => {
	const selectFragmentables = useMemo(selectFragmentablesById, []);
	const stateFragmentables = useSelector((state: IRootState) =>
		selectFragmentables(state, block.fragmentables)
	);
	const fragIds = stateFragmentables.reduce((accu, frag) => {
		accu.push(...frag.fragments);
		return accu;
	}, new Array<UUID>());

	const selectFragments = useMemo(selectFragmentsById, []);
	const stateFragments = useSelector((state: IRootState) =>
		selectFragments(state, fragIds)
	);

	const denormalizedBlock = {
		...block,
		fragmentables: stateFragmentables.map((f) => ({
			...f,
			fragments: stateFragments.filter((frag) =>
				f.fragments.includes(frag.id)
			),
		})),
	};

	const render = blockRenderers[denormalizedBlock.type];
	if (render) {
		return render(denormalizedBlock);
	}
	return null;
};

export default React.memo(Block);
