import './Floating.css';
import React, { CSSProperties, useRef } from 'react';

export interface IFloatingPosition {
	x: number;
	y: number;
	width: number;
	height: number;
	offsetX?: number;
	offsetY?: number;
}

export interface IFloatingProps {
	state: FloatingState;
	arrow?: boolean;
}

export type FloatingState = { visible: boolean; position: IFloatingPosition };

type FloatingAction =
	| { type: 'show'; position: IFloatingPosition }
	| { type: 'hide' };

const floatingReducer: React.Reducer<FloatingState, FloatingAction> = (
	state: FloatingState,
	action: FloatingAction
): FloatingState => {
	switch (action.type) {
		case 'show':
			return {
				visible: true,
				position: { ...state.position, ...action.position },
			};
		case 'hide':
			return {
				visible: false,
				position: state.position,
			};
		default:
			return state;
	}
};

const Floating: React.FC<IFloatingProps> = ({ state, arrow, children }) => {
	const floatingNode = useRef<HTMLDivElement>(null);
	const floatingPosition: CSSProperties = {
		left: `${state.position.x}px`,
		top: `${state.position.y}px`,
		transform: `translate(${state.position.offsetX || 0}px, ${
			state.position.offsetY || 0
		}px)`,
	};

	const fadeClass = state.visible ? 'fadeIn' : 'fadeOut';

	return (
		<div
			style={floatingPosition}
			className={`floating-container ${fadeClass}`}
			ref={floatingNode}
		>
			{arrow && (
				<div className="floating-arrow">
					<div className="floating-arrow-content" />
				</div>
			)}
			{children}
		</div>
	);
};

export default Floating;
export { floatingReducer };
