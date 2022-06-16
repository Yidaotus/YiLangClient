import './HSLColorPicker.css';
import React, { useMemo } from 'react';
import 'rc-slider/assets/index.css';
import Slider from 'rc-slider';

interface IHSLColorSliderProps {
	value: number;
	onChange: (value: number | number[]) => void;
	saturation: number;
	lightness: number;
}

const HSLColorPicker: React.FC<IHSLColorSliderProps> = ({
	value,
	onChange,
	saturation,
	lightness,
}) => {
	const backgroundGradiant = useMemo(() => {
		const blendSteps = 10;
		const blendPoints = [];
		for (let step = 0; step < 360; step += blendSteps) {
			blendPoints.push(`hsl(${step}, ${saturation}%, ${lightness}%)`);
		}

		const gradient = `linear-gradient(to right, ${blendPoints.join(',')})`;
		return gradient;
	}, [saturation, lightness]);

	return (
		<div className="slide-container">
			<Slider
				handleStyle={{
					height: '20px',
					width: '20px',
					backgroundColor: `hsl(${value}, ${saturation}%, ${lightness}%)`,
				}}
				trackStyle={{ background: 'none' }}
				railStyle={{ background: backgroundGradiant, height: '10px' }}
				value={value}
				onChange={onChange}
				min={0}
				max={360}
			/>
		</div>
	);
};

export default HSLColorPicker;
