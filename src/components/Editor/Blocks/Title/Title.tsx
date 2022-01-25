import DragContainer from '@components/Editor/DragContainer';
import { TitleElement } from '@components/Editor/YiEditor';
import { Box, Typography } from '@mui/material';
import React from 'react';
import { RenderElementProps } from 'slate-react';

interface TitleProps extends RenderElementProps {
	element: TitleElement;
}

const Title: React.FC<TitleProps> = ({ children, attributes, element }) => {
	return (
		<Box
			{...attributes}
			sx={{
				textAlign: element.align || 'left',
			}}
		>
			<DragContainer element={element}>
				<Typography
					variant={element.variant}
					sx={{ textAlign: element.align || 'left' }}
				>
					{children}
				</Typography>
			</DragContainer>
		</Box>
	);
};

export default Title;
