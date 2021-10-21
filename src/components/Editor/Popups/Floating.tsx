import './Floating.css';
import React, {
	CSSProperties,
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

const Floating: React.FC<IFloatingProps> = ({
	visible,
	arrow,
	parentElement,
	relativeBounding,
	children,
}) => {
	const [floatingStyle, setFloatingStyle] = useState<CSSProperties>({});
	const floatingNode = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (visible) {
			if (relativeBounding && parentElement.current) {
				const containerBounding =
					parentElement.current.getBoundingClientRect();

				if (relativeBounding && containerBounding) {
					const posX =
						relativeBounding.x + relativeBounding.width * 0.5;
					const posY = relativeBounding.y + relativeBounding.height;

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
	}, [parentElement, relativeBounding, visible]);

	return (
		<div
			style={floatingStyle}
			ref={floatingNode}
			className="floating-container"
		>
			{children}
		</div>
	);
};

export default Floating;
