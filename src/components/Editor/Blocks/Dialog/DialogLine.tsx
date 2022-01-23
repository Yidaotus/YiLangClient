import { DialogLine as DialogLineElement } from '@components/Editor/YiEditor';
import { Box } from '@mui/material';
import React from 'react';
import { RenderElementProps } from 'slate-react';
import DialogLineActor from './DialogLineActor';

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
				p: 1,
				flexDirection:
					element.alignment === 'left' ? 'row' : 'row-reverse',
			}}
			{...attributes}
		>
			<DialogLineActor element={element} />
			<Box
				sx={(theme) => ({
					borderRadius: 1,
					width: '100%',
					position: 'relative',
					p: 1,
					marginRight: element.alignment === 'left' ? 7 : 0,
					marginLeft: element.alignment === 'right' ? 7 : 0,
					backgroundColor: theme.palette.secondary.main,
					'&:after': {
						content: '""',
						position: 'absolute',
						display: 'block',
						width: 0,
						zIndex: 1,
						borderStyle: 'solid',
						borderColor: `transparent ${theme.palette.secondary.main}`,
						borderWidth:
							element.alignment === 'left'
								? '5px 5px 5px 0'
								: '5px 0 5px 5px',
						top: '50%',
						left: element.alignment === 'left' && '-5px',
						right: element.alignment === 'right' && '-5px',
						marginTop: '-5px',
					},
				})}
			>
				{children}
			</Box>
		</Box>
	);
};

export default DialogLine;
