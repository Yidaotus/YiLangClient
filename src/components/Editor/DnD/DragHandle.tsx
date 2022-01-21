import React from 'react';
import { IconButton } from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import DragImage from './DragImage';
import { ConnectDragPreview, DragPreviewImage } from 'react-dnd';

interface DragHandleProps {
	previewRef?: ConnectDragPreview;
}

const DragHandle = React.forwardRef<HTMLButtonElement, DragHandleProps>(
	({ previewRef }, ref) => {
		return (
			<div contentEditable={false} style={{ userSelect: 'none' }}>
				{previewRef && (
					<DragPreviewImage src={DragImage} connect={previewRef} />
				)}

				<IconButton
					className="drag-handle"
					ref={ref}
					color="primary"
					aria-label="drag block"
					component="span"
					sx={{
						userSelect: 'none',
						position: 'absolute',
						top: '0',
						left: '0',
						marginLeft: '-30px',
						marginTop: '6px',
						color: 'lightgray',
						':hover': {
							opacity: '100%',
							backgroundColor: 'white',
						},
					}}
					disableRipple
				>
					<DragIndicatorIcon fontSize="small" />
				</IconButton>
			</div>
		);
	}
);

export default DragHandle;
