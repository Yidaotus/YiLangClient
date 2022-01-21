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
			sx={{
				paddingBottom: 1,
				paddingLeft: 1,
			}}
			{...attributes}
		>
			{children}
		</Grid>
	);
};

export default DialogLineSpeech;
