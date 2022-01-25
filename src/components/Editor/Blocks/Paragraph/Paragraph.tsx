import { ParagraphElement } from '@components/Editor/YiEditor';
import { Box } from '@mui/material';
import React from 'react';
import { RenderElementProps } from 'slate-react';
import DragContainer from '@components/Editor/DragContainer';

interface ParagraphProps extends RenderElementProps {
	element: ParagraphElement;
}

const Paragraph: React.FC<ParagraphProps> = ({
	children,
	attributes,
	element,
}) => {
	return (
		<Box
			{...attributes}
			sx={{
				textAlign: element.align || 'left',
				p: 1,
				position: 'relative',
			}}
		>
			<DragContainer element={element}>{children}</DragContainer>
		</Box>
	);
};

export default Paragraph;
