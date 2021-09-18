import { Button, Tooltip } from 'antd';
import React from 'react';
import { IToolbarItem } from './ToolbarItem';

export interface IToolbarActionItem extends IToolbarItem {
	type: 'Action';
	action: () => void;
}

const ActionItem: React.FC<IToolbarActionItem> = ({
	name,
	icon,
	tooltip,
	action,
	visible,
}): JSX.Element => {
	return (
		<div style={{ display: `${visible ? 'block' : 'none'}` }}>
			<Tooltip title={tooltip} key={name} mouseEnterDelay={1}>
				<Button
					className="button"
					onMouseDown={(event) => {
						event.preventDefault();
					}}
					onMouseUp={() => {
						action();
					}}
				>
					{icon}
				</Button>
			</Tooltip>
		</div>
	);
};

export default ActionItem;
