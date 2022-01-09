import './InnerModal.css';
import React, { useRef } from 'react';
import useClickOutside from '@hooks/useClickOutside';

export interface IModalProps {
	onClose: () => void;
	width: string;
}

const InnerModal: React.FC<IModalProps> = ({ onClose, children, width }) => {
	const innerContainer = useRef(null);
	useClickOutside(innerContainer, onClose);

	return (
		<div className="modal-outer">
			<div className="modal-table">
				<div
					className="modal-inner"
					style={{ width }}
					role="none"
					ref={innerContainer}
				>
					{children}
				</div>
			</div>
		</div>
	);
};

export default InnerModal;
