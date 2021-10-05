import { IScreenPosition } from '@hooks/useSelectedText';
import { IDocumentSelection } from 'Document/Document';
import {
	FragmentSelectionResult,
	getFragmentsInRange,
} from 'Document/Fragment';
import { notUndefined } from 'Document/Utility';
import { createSelector } from 'reselect';
import { IRootState } from 'store';

export interface IClickedFragment {
	selection: IDocumentSelection;
	location: IScreenPosition;
}
const selectClickedFragment = (state: IRootState): IClickedFragment | null => {
	let clickResult = null;
	const { selection } = state.editor;
	if (selection && selection.collapsed) {
		clickResult = {
			selection: selection.documentSelection,
			location: selection.focusPosition,
		};
	}
	return clickResult;
};

const selectActiveFragmentLayer = createSelector(
	(state: IRootState) => state.editor.fragmentLayers,
	(state: IRootState) => state.editor.selectedFragmentLayer,
	(fragmentLayers, selectedFragmentLayer) => {
		const activeFragmentLayer = fragmentLayers.find(
			(layer) => layer.id === selectedFragmentLayer
		);
		if (activeFragmentLayer) {
			return activeFragmentLayer.fragments;
		}
		return null;
	}
);

const selectShowSpelling = (state: IRootState) => state.editor.showSpelling;

const selectAvailableLayers = createSelector(
	(state: IRootState) => state.editor.fragmentLayers,
	(fragmentLayers) =>
		fragmentLayers.map((layer) => ({ id: layer.id, name: layer.name }))
);

const selectedFragmentsSelector = createSelector(
	(state: IRootState) => state.editor.selection,
	(state: IRootState) => state.editor.fragmentables,
	selectActiveFragmentLayer,
	(selection, fragmentables, fragments) => {
		let selectionResult: FragmentSelectionResult[] = [];
		if (selection && fragments) {
			const { documentSelection } = selection;
			const { fragmentableId } = documentSelection;
			const fragmentableFragments = fragmentables[
				fragmentableId
			]?.fragments
				.map((fragId) => fragments[fragId])
				.filter(notUndefined);
			if (fragmentableFragments) {
				selectionResult = getFragmentsInRange({
					range: documentSelection.fragmentableRange,
					fragments: fragmentableFragments,
				});
			}
		}
		return selectionResult;
	}
);

const selectClickedFragmentSelector = createSelector(
	(state: IRootState) => state.editor.selection,
	selectedFragmentsSelector,
	(selection, fragmentSelection) => {
		if (fragmentSelection.length === 1 && selection?.collapsed) {
			if (
				fragmentSelection[0].children &&
				fragmentSelection[0].children.length === 1
			) {
				return {
					fragmentSelection: fragmentSelection[0].children[0],
					position: selection.focusPosition,
				};
			}
			return {
				fragmentSelection: fragmentSelection[0],
				position: selection.focusPosition,
			};
		}
		return null;
	}
);

// eslint-disable-next-line import/prefer-default-export
export {
	selectActiveFragmentLayer,
	selectClickedFragment,
	selectClickedFragmentSelector,
	selectAvailableLayers,
	selectedFragmentsSelector,
	selectShowSpelling,
};
