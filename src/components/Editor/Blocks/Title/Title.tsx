import DragContainer from '@components/Editor/DragContainer';
import { TitleElement } from '@components/Editor/YiEditor';
import { Box } from '@mui/material';
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
				position: 'relative',
			}}
		>
			<DragContainer element={element}>
				<h1 style={{ textAlign: element.align || 'left' }}>
					{children}
				</h1>
			</DragContainer>
		</Box>
	);
};

export default Title;
