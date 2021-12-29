import { IconButton, ToggleButton, Tooltip } from '@mui/material';
import React from 'react';

const toolbarItemTypes = ['Wrapper', 'Dropdown', 'Action'] as const;
export type ToolbarItemType = typeof toolbarItemTypes[number];

export interface IToolbarItem {
	title: string;
	enabled?: boolean;
	icon?: React.ReactNode | string;
	text?: React.ReactNode | string;
	tooltip?: string;
	active?: boolean;
	className?: string;
}

export interface IToolbarButtonProps extends IToolbarItem {
	action: () => void;
}

const ToolbarButton: React.FC<IToolbarButtonProps> = ({
	enabled = true,
	icon,
	text,
	tooltip,
	active,
	action,
	className,
}) => (
	<Tooltip title={tooltip || ''}>
		<ToggleButton
			disabled={!enabled}
			value="test"
			onClick={() => {
				if (enabled) {
					action();
				}
			}}
			selected={active}
		>
			{icon}
		</ToggleButton>
	</Tooltip>
);

export default ToolbarButton;
