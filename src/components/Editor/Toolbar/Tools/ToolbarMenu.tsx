import './ToolbarMenu.css';
import React from 'react';
import ToolbarButton from './ToolbarButton';

export interface IToolbarMenuProps {
	type: string;
	icon: React.ReactNode;
	title: string;
	menus: Record<string, boolean>;
	onMenuToggle: (type: string) => void;
	active?: boolean;
}

const ToolbarMenu: React.FC<IToolbarMenuProps> = ({
	type,
	icon,
	title,
	menus,
	onMenuToggle,
	children,
	active,
}) => (
	<div>
		<ToolbarButton
			icon={icon}
			title={title}
			active={active}
			action={() => onMenuToggle(type)}
		/>
		<div
			className={`toolbar_menu menu_${type}`}
			style={{ display: menus[type] ? 'block' : 'none' }}
			role="none"
		>
			{menus[type] && children}
		</div>
	</div>
);
export default ToolbarMenu;