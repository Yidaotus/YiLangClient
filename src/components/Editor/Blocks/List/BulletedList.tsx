import React from 'react';
import { BulletedListElement } from '@components/Editor/YiEditor';
import { Box } from '@mui/material';
import { RenderElementProps } from 'slate-react';
import DragContainer from '@components/Editor/DragContainer';

interface BulletedListProps extends RenderElementProps {
	element: BulletedListElement;
}

const BulletedList: React.FC<BulletedListProps> = ({
	children,
	attributes,
	element,
}) => {
	return (
		<Box {...attributes}>
			<DragContainer element={element}>
				<ul>{children}</ul>
			</DragContainer>
		</Box>
	);
};

export default BulletedList;
