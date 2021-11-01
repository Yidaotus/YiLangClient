import { Button } from 'antd';
import React from 'react';

const toolbarItemTypes = ['Wrapper', 'Dropdown', 'Action'] as const;
export type ToolbarItemType = typeof toolbarItemTypes[number];

export interface IToolbarItem {
	title: string;
	enabled?: boolean;
	icon?: React.ReactNode;
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
	tooltip,
	active,
	action,
	className,
}) => (
	<Button
		className={`button ${className}`}
		type={active ? 'primary' : 'default'}
		size="large"
		onMouseUp={action}
		title={tooltip}
		disabled={!enabled}
	>
		{icon}
	</Button>
);

export default ToolbarButton;
