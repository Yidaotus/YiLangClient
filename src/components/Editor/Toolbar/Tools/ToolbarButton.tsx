import React from 'react';
import { Button, IconName, Intent } from '@blueprintjs/core';

const toolbarItemTypes = ['Wrapper', 'Dropdown', 'Action'] as const;
export type ToolbarItemType = typeof toolbarItemTypes[number];

export interface IToolbarItem {
	title: string;
	enabled?: boolean;
	icon?: IconName;
	text?: React.ReactNode;
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
	<Button
		className={`bp3-minimal button ${className}`}
		large
		intent={active ? Intent.PRIMARY : Intent.NONE}
		icon={icon}
		onMouseUp={action}
		title={tooltip}
		disabled={!enabled}
	>
		{text}
	</Button>
);

export default ToolbarButton;
