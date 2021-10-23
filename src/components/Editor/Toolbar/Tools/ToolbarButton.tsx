import { Button } from 'antd';
import React from 'react';

const toolbarItemTypes = ['Wrapper', 'Dropdown', 'Action'] as const;
export type ToolbarItemType = typeof toolbarItemTypes[number];

export interface IToolbarItem {
	title: string;
	icon?: React.ReactNode;
	tooltip?: string;
	active?: boolean;
	className?: string;
}

export interface IToolbarButtonProps extends IToolbarItem {
	action: () => void;
}

const ToolbarButton: React.FC<IToolbarButtonProps> = ({
	title,
	icon,
	tooltip,
	active,
	action,
	className,
}) => (
	<Button
		className={`button ${className}`}
		type={active ? 'primary' : 'default'}
		style={{
			fill: active ? 'white' : 'black',
		}}
		size="large"
		onMouseUp={action}
		title={tooltip}
	>
		{icon}
	</Button>
);

export default ToolbarButton;
