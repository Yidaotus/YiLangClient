import { ToggleButton, Tooltip } from '@mui/material';
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
	action: (e: React.MouseEvent<HTMLButtonElement>) => void;
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
			size="small"
			value="left"
			onClick={(e) => {
				if (enabled) {
					action(e);
				}
			}}
			selected={active}
			className={className}
		>
			{icon}
		</ToggleButton>
	</Tooltip>
);

export default ToolbarButton;
