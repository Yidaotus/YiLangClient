import React from 'react';
import { NumberedListElement } from '@components/Editor/YiEditor';
import { Box } from '@mui/material';
import { RenderElementProps } from 'slate-react';
import DragContainer from '@components/Editor/DragContainer';

interface NumberedListProps extends RenderElementProps {
	element: NumberedListElement;
}

const NumberedList: React.FC<NumberedListProps> = ({
	children,
	attributes,
	element,
}) => {
	return (
		<Box {...attributes}>
			<DragContainer element={element}>
				<ol>{children}</ol>
			</DragContainer>
		</Box>
	);
};

export default NumberedList;
