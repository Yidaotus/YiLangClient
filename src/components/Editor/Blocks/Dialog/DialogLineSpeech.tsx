import { Grid } from '@mui/material';
import React from 'react';
import { RenderElementProps } from 'slate-react';

type DialogLineSpeechProps = Omit<RenderElementProps, 'element'>;

const DialogLineSpeech: React.FC<DialogLineSpeechProps> = ({
	children,
	attributes,
}) => {
	return (
		<Grid
			item
			xs="auto"
			sx={(theme) => ({
				paddingBottom: 1,
				paddingLeft: 1,
				borderRadius: 1,
				width: '100%',
				p: 1,
				backgroundColor: theme.palette.secondary.main,
			})}
			{...attributes}
		>
			{children}
		</Grid>
	);
};

export default DialogLineSpeech;
