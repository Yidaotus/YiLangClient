import {
	Avatar,
	Box,
	IconButton,
	Popover,
	Stack,
	styled,
	TextField,
	ToggleButton,
	ToggleButtonGroup,
} from '@mui/material';
import React, { useState } from 'react';
import CircleIcon from '@mui/icons-material/Circle';
import AlignHorizontalLeftIcon from '@mui/icons-material/AlignHorizontalLeft';
import AlignHorizontalRightIcon from '@mui/icons-material/AlignHorizontalRight';
import { green, blue, orange, red } from '@mui/material/colors';
import { ReactEditor, useSlateStatic } from 'slate-react';
import { Transforms } from 'slate';
import { DialogLine } from '@components/Editor/YiEditor';

const RoundIconButton = styled(IconButton)(() => ({
	borderRadius: 100,
}));

const RoundToggleButton = styled(ToggleButton)(() => ({
	borderRadius: 100,
}));

const DialogLineActor: React.FC<{ element: DialogLine }> = ({ element }) => {
	const editor = useSlateStatic();
	const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
	const [nameState, setNameState] = useState(element.name);
	const [colorState, setColorState] = useState(element.color);
	const [alignmentState, setAlignmentState] = useState(element.alignment);

	const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		setAnchorEl(event.currentTarget);
	};
	const handleClose = () => {
		const path = ReactEditor.findPath(editor, element);
		if (path) {
			Transforms.setNodes(
				editor,
				{
					name: nameState,
					color: colorState,
					alignment: alignmentState,
				},
				{ at: path }
			);
		}
		setAnchorEl(null);
	};

	const colorButtonHandler = (
		event: React.MouseEvent<HTMLElement>,
		newColor: string
	) => {
		setColorState(newColor);
	};

	const alignmentButtonHandler = (
		event: React.MouseEvent<HTMLElement>,
		newAlignment: 'left' | 'right'
	) => {
		setAlignmentState(newAlignment);
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
				paddingX: 1,
				'& span': {
					fontWeight: 'bold',
				},
				userSelect: 'none',
			}}
			contentEditable={false}
		>
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
				}}
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
					<Stack spacing={1} direction="column" sx={{ p: 1 }}>
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
						<Box sx={{ display: 'flex' }}>
							<ToggleButtonGroup
								value={alignmentState}
								onChange={alignmentButtonHandler}
								exclusive
								size="small"
							>
								<ToggleButton value="left">
									<AlignHorizontalLeftIcon />
								</ToggleButton>
								<ToggleButton value="right">
									<AlignHorizontalRightIcon />
								</ToggleButton>
							</ToggleButtonGroup>
						</Box>
					</Stack>
				</Popover>
			</div>
		</Box>
	);
};

export default DialogLineActor;
