import { DocumentTitleElement } from '@components/Editor/YiEditor';
import { Typography } from '@mui/material';
import React from 'react';
import { RenderElementProps } from 'slate-react';

interface DocumentTitleProps extends RenderElementProps {
	element: DocumentTitleElement;
}

const DocumentTitle: React.FC<DocumentTitleProps> = ({
	children,
	attributes,
	element,
}) => {
	const empty =
		element.children.length < 1 || element.children[0].text.length < 1;
	return (
		<Typography
			sx={(theme) => ({
				borderBottom: `5px solid ${theme.palette.secondary.light}`,
				position: 'relative',
				m: 2,
			})}
			variant="h3"
			component="div"
			{...attributes}
		>
			{children}
			{empty && (
				<span
					style={{
						position: 'absolute',
						color: 'lightgray',
						left: 0,
						top: 0,
						userSelect: 'none',
						pointerEvents: 'none',
					}}
					contentEditable="false"
				>
					Untitled
				</span>
			)}
		</Typography>
	);
};

export default DocumentTitle;
