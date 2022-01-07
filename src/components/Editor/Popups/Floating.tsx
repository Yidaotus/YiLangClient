/* eslint-disable no-param-reassign */
import './Floating.css';
import React, {
	CSSProperties,
	MutableRefObject,
	RefObject,
	useEffect,
	useRef,
	useState,
} from 'react';

export interface IFloatingPosition {
	x: number;
	y: number;
	width: number;
	height: number;
	offsetX?: number;
	offsetY?: number;
}

export interface IFloatingProps {
	visible: boolean;
	parentElement: RefObject<HTMLElement>;
	relativeBounding: DOMRect | null;
	arrow?: boolean;
}

const Floating = React.forwardRef<
	HTMLDivElement,
	React.PropsWithChildren<IFloatingProps>
>(
	(
		{ visible, arrow, parentElement, relativeBounding, children },
		floatingRef
	) => {
		const floatingNode = useRef<HTMLDivElement>(null);
		const [floatingStyle, setFloatingStyle] = useState<CSSProperties>({});

		useEffect(() => {
			if (visible) {
				if (relativeBounding && parentElement.current) {
					const containerBounding =
						parentElement.current.getBoundingClientRect();

					if (relativeBounding && containerBounding) {
						const posX =
							relativeBounding.x + relativeBounding.width * 0.5;
						const posY =
							relativeBounding.y + relativeBounding.height;

						const relativeX = posX - containerBounding.x;
						const relativeY = posY - containerBounding.y;

						const floatingBounding =
							floatingNode.current?.getBoundingClientRect();
						const floatingHeight = floatingBounding?.height || 0;
						const floatingWidth = floatingBounding?.width || 0;

						const offsetY = 5;
						const bufferSpace = 25;
						const shouldRenderAbove =
							relativeBounding.y +
								relativeBounding.height +
								floatingHeight +
								offsetY >
							window.innerHeight - bufferSpace;

						const top =
							relativeY +
							(shouldRenderAbove
								? -(
										floatingHeight +
										offsetY +
										relativeBounding.height
								  )
								: offsetY);
						const leftClampLeft = Math.max(
							-containerBounding.x + 10,
							relativeX - floatingWidth * 0.5
						);
						const leftClampRight = Math.min(
							leftClampLeft,
							window.innerWidth -
								(containerBounding.x + floatingWidth + 20)
						);

						setFloatingStyle({
							left: leftClampRight,
							top,
							visibility: 'visible',
							opacity: '100%',
						});
					}
				}
			} else {
				setFloatingStyle({
					visibility: 'hidden',
					opacity: '0%',
				});
			}
		}, [floatingNode, parentElement, relativeBounding, visible]);

		return (
			<div
				style={floatingStyle}
				ref={(node) => {
					if (node) {
						(
							floatingNode as MutableRefObject<HTMLDivElement>
						).current = node;
						if (typeof floatingRef === 'function') {
							floatingRef(node);
						} else if (floatingRef) {
							(
								floatingRef as MutableRefObject<HTMLDivElement>
							).current = node;
						}
					}
				}}
				className={`floating-container ${arrow && 'arrow'}`}
			>
				{children}
			</div>
		);
	}
);

export default Floating;
