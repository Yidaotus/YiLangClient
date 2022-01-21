import { Avatar, Box } from '@mui/material';
import React from 'react';
import { RenderElementProps } from 'slate-react';

type DialogLineActorProps = Omit<RenderElementProps, 'element'>;

const DialogLineActor: React.FC<DialogLineActorProps> = ({
	children,
	attributes,
}) => {
	return (
		<Box
			sx={{
				display: 'flex',
				alignItems: 'center',
				p: 1,
				'& span': {
					fontWeight: 'bold',
				},
			}}
			{...attributes}
		>
			<div
				style={{
					userSelect: 'none',
					display: 'flex',
					alignItems: 'center',
				}}
				contentEditable={false}
			>
				<Avatar sx={{ width: 24, height: 24, marginRight: 1 }} />
			</div>
			{children}
		</Box>
	);
};

export default DialogLineActor;
