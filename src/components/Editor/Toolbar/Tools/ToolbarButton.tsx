import { IconButton, ToggleButton, Tooltip } from '@mui/material';
import React from 'react';

const toolbarItemTypes = ['Wrapper', 'Dropdown', 'Action'] as const;
export type ToolbarItemType = typeof toolbarItemTypes[number];

export interface IToolbarItem {
	title: string;
	enabled?: boolean;
	icon?: React.ReactElement | string;
	text?: React.ReactElement | string;
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
			size="small"
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
