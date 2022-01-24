import React from 'react';
import {
	Alert,
	Box,
	ClickAwayListener,
	Grow,
	IconButton,
	Paper,
	Popper,
} from '@mui/material';

interface ConfirmButtonProps {
	icon: React.ReactElement;
	onConfirm: () => void;
}
const ConfirmButton: React.FC<ConfirmButtonProps> = ({ onConfirm, icon }) => {
	const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
		null
	);
	const inConfirmState = Boolean(anchorEl);

	const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		if (inConfirmState) {
			onConfirm();
			setAnchorEl(null);
		} else {
			const target = event.currentTarget;
			setTimeout(() => {
				setAnchorEl(target);
			}, 400);
		}
	};
	const handleClose = () => {
		setAnchorEl(null);
	};
	const id = inConfirmState ? 'simple-popover' : undefined;

	return (
		<ClickAwayListener onClickAway={handleClose}>
			<Box>
				<IconButton
					sx={{
						color: (theme) =>
							inConfirmState
								? theme.palette.warning.main
								: theme.palette.primary.main,
					}}
					onClick={handleClick}
				>
					{icon}
				</IconButton>
				<Popper
					id={id}
					open={inConfirmState}
					anchorEl={anchorEl}
					placement="bottom"
					transition
				>
					{({ TransitionProps }) => (
						<Grow {...TransitionProps} timeout={350}>
							<Paper elevation={3} sx={{ width: '280px' }}>
								<Alert
									severity="warning"
									sx={{
										'& .MuiAlert-icon': {
											alignSelf: 'center',
										},
									}}
								>
									Please confirm by clicking again. This can't
									be undone!
								</Alert>
							</Paper>
						</Grow>
					)}
				</Popper>
			</Box>
		</ClickAwayListener>
	);
};

export default ConfirmButton;
