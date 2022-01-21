import { Box } from '@mui/material';
import React from 'react';
import { RenderElementProps } from 'slate-react';

type DialogLineProps = Omit<RenderElementProps, 'element'>;

const DialogLine: React.FC<DialogLineProps> = ({ children, attributes }) => {
	return (
		<Box
			{...attributes}
			sx={(theme) => ({
				wordBreak: 'break-all',
				whiteSpace: 'pre-wrap',
				'&:nth-child(2n)': {
					backgroundColor: theme.palette.secondary.light,
					borderRadius: '2px',
				},
			})}
		>
			{children}
		</Box>
	);
};

export default DialogLine;
