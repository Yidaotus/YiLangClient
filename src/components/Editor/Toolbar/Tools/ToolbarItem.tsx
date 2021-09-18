const toolbarItemTypes = ['Wrapper', 'Dropdown', 'Action'] as const;
export type ToolbarItemType = typeof toolbarItemTypes[number];

export interface IToolbarItem {
	type: ToolbarItemType;
	name: string;
	icon?: React.ReactNode;
	tooltip?: string;
	options?: JSX.Element;
	visible: boolean;
}
