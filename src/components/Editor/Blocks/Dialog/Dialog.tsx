import { DialogElement } from '@components/Editor/YiEditor';
import React from 'react';
import { RenderElementProps } from 'slate-react';
import DragContainer from '@components/Editor/DragContainer';
import { Box } from '@mui/material';

interface DialogProps extends RenderElementProps {
	element: DialogElement;
}

const Dialog: React.FC<DialogProps> = ({ children, attributes, element }) => {
	return (
		<Box
			{...attributes}
			sx={{
				paddingY: 1,
				position: 'relative',
			}}
		>
			<DragContainer element={element}>{children}</DragContainer>
		</Box>
	);
};

export default Dialog;
