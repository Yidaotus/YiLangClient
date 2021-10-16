import { Button, Dropdown, Menu, Tooltip } from 'antd';
import React from 'react';
import { IToolbarItem } from './ToolbarItem';

export interface IDropdownAction {
	name: string;
	action: () => void;
}

export interface IToolbarDropdownItem extends IToolbarItem {
	items: IDropdownAction[];
}

const DropdownItem: React.FC<IToolbarDropdownItem> = ({
	name,
	icon,
	tooltip,
	items,
	visible,
}): JSX.Element => {
	return (
		<div style={{ display: `${visible ? 'block' : 'none'}` }}>
			<Tooltip title={tooltip} key={name} mouseEnterDelay={1}>
				<Dropdown
					overlay={
						<Menu selectable>
							<Menu.ItemGroup>
								{items.map((dropdownItem) => (
									<Menu.Item
										key={dropdownItem.name}
										onClick={() => {
											dropdownItem.action();
										}}
										onMouseDown={(e) => {
											// Fix so slate doesn't lose selection
											e.preventDefault();
										}}
									>
										{dropdownItem.name}
									</Menu.Item>
								))}
							</Menu.ItemGroup>
						</Menu>
					}
					trigger={['click']}
					placement="bottomCenter"
				>
					<Button>{icon}</Button>
				</Dropdown>
			</Tooltip>
		</div>
	);
};

export default DropdownItem;
