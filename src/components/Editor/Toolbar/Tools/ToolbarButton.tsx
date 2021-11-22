import React from 'react';
import { AnchorButton, IconName, Intent } from '@blueprintjs/core';
import { Popover2, Tooltip2 } from '@blueprintjs/popover2';

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
	<Popover2>
		<Tooltip2
			content={tooltip}
			openOnTargetFocus
			hoverOpenDelay={200}
			position="bottom"
		>
			<AnchorButton
				className={`bp3-minimal button ${className}`}
				large
				intent={active ? Intent.PRIMARY : Intent.NONE}
				icon={icon}
				onMouseUp={action}
				disabled={!enabled}
			>
				{text}
			</AnchorButton>
		</Tooltip2>
	</Popover2>
);

export default ToolbarButton;
