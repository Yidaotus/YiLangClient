import { selectClickedFragmentSelector } from '@store/editor/selectors';
import { isFragmentType } from 'Document/Fragment';
import React from 'react';
import { useSelector } from 'react-redux';
import DictPopup from './DictPopup';

const DictPopupController: React.FC = () => {
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

	let wordFragment;
	if (
		clickedFragment?.fragmentSelection.fragment &&
		isFragmentType('Word')(clickedFragment.fragmentSelection.fragment)
	) {
		wordFragment = clickedFragment.fragmentSelection.fragment;
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
		<DictPopup
			popupState={popupState}
			dictId={wordFragment?.data.dictId || null}
		/>
	);
};

export default DictPopupController;
