import './YiColorPickerField.css';

import React, { CSSProperties, useEffect, useRef, useState } from 'react';
import useClickOutside from '@hooks/useClickOutside';
import HSLColorPicker from '@components/HSLColorPicker/HSLColorPicker';
import { ColorLens } from '@mui/icons-material';
import { IconButton } from '@mui/material';

const DEFAULT_TAG_COLOR = {
	colorValue: 0,
	saturation: 50,
	lightness: 70,
};

export interface YiColorPickerFieldProps {
	value?: string;
	onChange?: (value: string) => void;
}
const YiColorPickerField: React.FC<YiColorPickerFieldProps> = (
	props: YiColorPickerFieldProps
) => {
	const { value, onChange } = props;
	const [selectedColorValue, setSelectedColorValue] = useState(
		DEFAULT_TAG_COLOR.colorValue
	);
	const saturation = DEFAULT_TAG_COLOR.saturation;
	const lightness = DEFAULT_TAG_COLOR.lightness;

	useEffect(() => {
		if (onChange) {
			onChange(
				`hsl(${selectedColorValue}, ${saturation}%, ${lightness}%)`
			);
		}
	}, [lightness, onChange, saturation, selectedColorValue]);

	const [pickerVisible, setPickerVisible] = useState(false);
	const popover = useRef<HTMLDivElement>(null);

	const colorButtonStyle: CSSProperties = {
		backgroundColor: value,
	};

	const handleClick = () => {
		setPickerVisible((current) => !current);
	};

	const handleClose = () => {
		setPickerVisible(false);
	};

	useClickOutside(popover, handleClose);

	return (
		<div>
			<IconButton
				style={colorButtonStyle}
				className="color-input-box"
				onClick={handleClick}
				onKeyPress={() => {}}
				tabIndex={0}
				aria-label="Open Colorpicker"
			>
				<ColorLens />
			</IconButton>
			{pickerVisible ? (
				<div className="tagform-color-picker" ref={popover}>
					<HSLColorPicker
						value={selectedColorValue}
						onChange={(newColorValue) => {
							if (!Array.isArray(newColorValue)) {
								setSelectedColorValue(newColorValue);
							}
						}}
						saturation={saturation}
						lightness={lightness}
					/>
				</div>
			) : null}
		</div>
	);
};

export default YiColorPickerField;
export { DEFAULT_TAG_COLOR };
