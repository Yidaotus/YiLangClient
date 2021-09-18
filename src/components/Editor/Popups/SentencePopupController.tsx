import { selectClickedFragmentSelector } from '@store/editor/selectors';
import { isFragmentType } from 'Document/Fragment';
import React from 'react';
import { useSelector } from 'react-redux';
import SimpleDisplay from './SimpleDisplay';

const SentencePopupController: React.FC = () => {
	const clickedFragment = useSelector(selectClickedFragmentSelector);

	let popupState = {
		visible: false,
		position: {
			x: 0,
			y: 0,
			width: 0,
			height: 0,
		},
	};

	let sentenceValue;
	if (
		clickedFragment?.fragmentSelection.fragment &&
		isFragmentType('Sentence')(clickedFragment.fragmentSelection.fragment)
	) {
		sentenceValue =
			clickedFragment.fragmentSelection.fragment.data.translation;
		popupState = {
			visible: true,
			position: {
				x: clickedFragment.position.x,
				y: clickedFragment.position.y + 5,
				width: clickedFragment.position.width,
				height: clickedFragment.position.height,
			},
		};
	}
	return (
		<SimpleDisplay
			popupState={popupState}
			content={sentenceValue || null}
		/>
	);
};

export default SentencePopupController;
