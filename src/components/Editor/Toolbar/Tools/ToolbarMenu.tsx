import './ToolbarMenu.css';
import React from 'react';
import { IconName } from '@blueprintjs/core';
import ToolbarButton from './ToolbarButton';

export interface IToolbarMenuProps {
	type: string;
	icon: IconName;
	title: string;
	menus: Record<string, boolean>;
	onMenuToggle: (type: string) => void;
	flow?: 'vertical' | 'horizontal';
	active?: boolean;
	enabled?: boolean;
}

const ToolbarMenu: React.FC<IToolbarMenuProps> = ({
	type,
	icon,
	title,
	menus,
	onMenuToggle,
	children,
	active,
	enabled = true,
	flow = 'horizontal',
}) => (
	<div>
		<ToolbarButton
			icon={icon}
			title={title}
			active={active}
			action={() => onMenuToggle(type)}
			enabled={enabled}
		/>
		<div
			className={`toolbar_menu menu_${type}`}
			style={{
				display: menus[type] ? 'flex' : 'none',
				flexDirection: flow === 'horizontal' ? 'row' : 'column',
			}}
			role="none"
		>
			{menus[type] && children}
		</div>
	</div>
);
export default ToolbarMenu;
