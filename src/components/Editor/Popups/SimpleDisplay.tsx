import React from 'react';
import Floating, { FloatingState } from './Floating';
import './SimpleDisplay.css';

interface ISimpleInputProps {
	popupState: FloatingState;
	content: string | null;
}

const SimpleDisplay: React.FC<ISimpleInputProps> = ({
	popupState,
	content,
}) => {
	return (
		<Floating state={popupState} arrow>
			<div
				className="simple-display-container"
				onKeyDown={() => {}}
				tabIndex={-1}
				role="button"
				onClick={(e) => {
					e.stopPropagation();
				}}
			>
				<span>{content}</span>
			</div>
		</Floating>
	);
};

export default SimpleDisplay;
