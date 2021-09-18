/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import { RetweetOutlined } from '@ant-design/icons';
import { Divider, Tooltip } from 'antd';
import React from 'react';

interface IColorPickerProps {
	selectedColor: [number, string];
	setSelectedColor: React.Dispatch<React.SetStateAction<[number, string]>>;
	markColors: Array<string>;
}

const colorIds = [0, 1, 2, 3, 4, 5, 6, 7, 8];

const ColorPicker: React.FC<IColorPickerProps> = ({
	selectedColor,
	setSelectedColor,
	markColors,
}) => {
	return (
		<div className="slide-container">
			<input
				type="range"
				min="1"
				max="100"
				value="50"
				className="slider"
				id="myRange"
			/>
		</div>
	);
};

export default ColorPicker;
