import { DialogLine as DialogLineElement } from '@components/Editor/YiEditor';
import { Box } from '@mui/material';
import React from 'react';
import { RenderElementProps } from 'slate-react';

type DialogLineProps = RenderElementProps & { element: DialogLineElement };

const DialogLine: React.FC<DialogLineProps> = ({
	children,
	attributes,
	element,
}) => {
	return (
		<Box
			{...attributes}
			sx={{
				display: 'flex',
				width: '100%',
				p: 1,
				flexDirection:
					element.alignment === 'left' ? 'row' : 'row-reverse',
			}}
		>
			{children}
		</Box>
	);
};

export default DialogLine;
