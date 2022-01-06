import './ToolbarMenu.css';
import React, { useState } from 'react';
import ToolbarButton from './ToolbarButton';
import { Menu, MenuItem } from '@mui/material';

export interface IToolbarMenuProps {
	icon: React.ReactElement | string;
	title: string;
	active?: boolean;
	enabled?: boolean;
	className?: string;
}

const ToolbarMenu: React.FC<IToolbarMenuProps> = ({
	icon,
	title,
	children,
	active,
	enabled = true,
	className,
}) => {
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);
	const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		setAnchorEl(event.currentTarget);
	};
	const handleClose = () => {
		setAnchorEl(null);
	};

	return (
		<div>
			<ToolbarButton
				icon={icon}
				title={title}
				active={active}
				action={handleClick}
				enabled={enabled}
				tooltip={title}
				className={className}
			/>
			<Menu
				id="basic-menu"
				anchorEl={anchorEl}
				open={open}
				onClose={handleClose}
				MenuListProps={{
					'aria-labelledby': 'basic-button',
				}}
			>
				{children}
			</Menu>
		</div>
	);
};
export default ToolbarMenu;
