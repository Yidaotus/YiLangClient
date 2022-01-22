import {
	Avatar,
	Box,
	IconButton,
	Popover,
	styled,
	TextField,
	ToggleButton,
	ToggleButtonGroup,
} from '@mui/material';
import React, { useState } from 'react';
import CircleIcon from '@mui/icons-material/Circle';
import { green, blue, orange, red } from '@mui/material/colors';
import { ReactEditor, RenderElementProps, useSlateStatic } from 'slate-react';
import { DialogLineActor as DialogLineActorElement } from '@components/Editor/YiEditor';
import { Transforms } from 'slate';

type DialogLineActorProps = RenderElementProps & {
	element: DialogLineActorElement;
};

const RoundIconButton = styled(IconButton)(() => ({
	borderRadius: 100,
}));

const RoundToggleButton = styled(ToggleButton)(() => ({
	borderRadius: 100,
}));

const DialogLineActor: React.FC<DialogLineActorProps> = ({
	children,
	element,
	attributes,
}) => {
	const editor = useSlateStatic();
	const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
	const [nameState, setNameState] = useState(element.name);
	const [colorState, setColorState] = useState(element.color);

	const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		setAnchorEl(event.currentTarget);
	};
	const handleClose = () => {
		const path = ReactEditor.findPath(editor, element);
		if (path) {
			Transforms.setNodes(
				editor,
				{ name: nameState, color: colorState },
				{ at: path }
			);
		}
		setAnchorEl(null);
	};

	const colorButtonHandler = (
		event: React.MouseEvent<HTMLElement>,
		newColor: string | null
	) => {
		setColorState(newColor || undefined);
	};

	const keyPressHandler = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			handleClose();
		}
	};

	const open = Boolean(anchorEl);
	const id = open ? 'simple-popover' : undefined;

	return (
		<Box
			sx={{
				display: 'flex',
				alignItems: 'center',
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
				<RoundIconButton aria-describedby={id} onClick={handleClick}>
					<Avatar sx={{ width: 30, height: 30, bgcolor: colorState }}>
						{nameState ? nameState.slice(0, 1) : ''}
					</Avatar>
				</RoundIconButton>
				<Popover
					id={id}
					open={open}
					anchorEl={anchorEl}
					onClose={handleClose}
					anchorOrigin={{
						vertical: 'bottom',
						horizontal: 'left',
					}}
				>
					<Box
						sx={{ display: 'flex', flexDirection: 'column', p: 1 }}
					>
						<TextField
							placeholder="Name"
							size="small"
							value={nameState}
							onChange={(e) => setNameState(e.target.value)}
							onKeyPress={keyPressHandler}
						/>
						<Box sx={{ display: 'flex' }}>
							<ToggleButtonGroup
								value={colorState}
								onChange={colorButtonHandler}
								exclusive
								size="small"
							>
								<ToggleButton value="green">
									<CircleIcon sx={{ color: green[500] }} />
								</ToggleButton>
								<ToggleButton value="blue">
									<CircleIcon sx={{ color: blue[500] }} />
								</ToggleButton>
								<ToggleButton value="orange">
									<CircleIcon sx={{ color: orange[500] }} />
								</ToggleButton>
								<ToggleButton value="red">
									<CircleIcon sx={{ color: red[500] }} />
								</ToggleButton>
							</ToggleButtonGroup>
						</Box>
					</Box>
				</Popover>
			</div>
			{children}
		</Box>
	);
};

export default DialogLineActor;
