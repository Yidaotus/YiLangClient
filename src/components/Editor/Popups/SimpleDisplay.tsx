import React from 'react';
import Floating from './Floating';
import './SimpleDisplay.css';

interface ISimpleInputProps {
	rootElement: React.RefObject<HTMLElement>;
	content: string | null;
}

const SimpleDisplay: React.FC<ISimpleInputProps> = ({
	content,
	rootElement,
}) => {
	return (
		<Floating visible parentElement={rootElement} relativeBounding={null}>
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
