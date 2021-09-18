import { Button, Carousel } from 'antd';
import { CarouselRef } from 'antd/lib/carousel';
import React, {
	CSSProperties,
	useCallback,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from 'react';
import { FloatingState } from './Floating';
import './SimpleDisplay.css';

const contentStyle: CSSProperties = {
	height: '160px',
	color: '#fff',
	lineHeight: '160px',
	textAlign: 'center',
	background: '#364d79',
};

interface IStackablePopupProps {
	state: FloatingState;
}

export interface IStackableRef {
	pushLayer: (layer: JSX.Element) => void;
	popLayer: () => void;
}

const StackablePopup: React.ForwardRefExoticComponent<
	IStackablePopupProps & React.RefAttributes<IStackableRef>
> = React.forwardRef((props, ref) => {
	const { state } = props as IStackablePopupProps;
	const [layers, setLayers] = useState<Array<JSX.Element>>([]);
	const [previousLayerIndex, setPreviousLayerIndex] = useState(-1);
	const [visibleLayerIndex, setVisibleLayerIndex] = useState(-1);
	const carousellRef = useRef<CarouselRef>(null);

	const pushLayer = useCallback(
		(layer: JSX.Element) => {
			setVisibleLayerIndex(visibleLayerIndex + 1);
			setLayers((current) => [...current, layer]);
		},
		[visibleLayerIndex]
	);

	const popLayer = useCallback(() => {
		if (visibleLayerIndex > 0) {
			setVisibleLayerIndex(visibleLayerIndex - 1);
			setPreviousLayerIndex(visibleLayerIndex);
		}
	}, [visibleLayerIndex]);

	useEffect(() => {
		if (carousellRef.current) {
			carousellRef.current.goTo(visibleLayerIndex);
		}
	}, [carousellRef, visibleLayerIndex]);

	useImperativeHandle(
		ref,
		() => {
			return {
				popLayer,
				pushLayer,
			};
		},
		[popLayer, pushLayer]
	);

	return (
		<>
			<Button
				onClick={() => {
					if (carousellRef.current) {
						carousellRef.current.next();
					}
				}}
			>
				Next
			</Button>
			<Carousel
				ref={carousellRef}
				dotPosition="bottom"
				afterChange={() => {
					if (previousLayerIndex > visibleLayerIndex) {
						const newLayers = [...layers];
						newLayers.splice(-1);
						setLayers(newLayers);
						setPreviousLayerIndex(visibleLayerIndex);
					}
				}}
				dots={false}
				slidesToShow={1}
				slidesToScroll={1}
				autoplay={false}
			>
				{layers.map((layer) => (
					// eslint-disable-next-line react/no-array-index-key
					<div key={layer.key} style={contentStyle}>
						{layer}
					</div>
				))}
			</Carousel>
		</>
	);
});

export default StackablePopup;
