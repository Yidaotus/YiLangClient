import './Toolbar.css';
import React, { useState } from 'react';
import { useSlateStatic } from 'slate-react';
import { BaseSelection } from 'slate';
import {
	AlignCenterOutlined,
	AlignLeftOutlined,
	AlignRightOutlined,
	BgColorsOutlined,
	FontColorsOutlined,
	OrderedListOutlined,
	RedoOutlined,
	TranslationOutlined,
	UndoOutlined,
	UnorderedListOutlined,
} from '@ant-design/icons';
import { Divider } from 'antd';
import WordInput from './Modals/WordEditor/WordEditor';
import AlignButton from './Tools/AlignButton';
import ListButton from './Tools/ListButton';
import ToolbarButton from './Tools/ToolbarButton';
import ToolbarMenu from './Tools/ToolbarMenu';
import TextColors from './TextColors';
import ColorButton from './Tools/ColorButton';

export interface IToolbarProps {
	selection: BaseSelection;
}

const Toolbar: React.FC<IToolbarProps> = ({ selection }) => {
	const editor = useSlateStatic();
	const [menus, setMenus] = useState<Record<string, boolean>>({});

	const sharedProps = {
		editor,
		selection,
		onChange: () => {
			console.log('something happened!');
		},
	};
	const menuProps = {
		menus,
		onMenuToggle: (type: string) => {
			setMenus({ ...menus, [type]: !menus[type] });
		},
	};

	return (
		<div className="toolbar">
			<ToolbarMenu
				type="wordEditor"
				icon={<TranslationOutlined />}
				title="Word Editor"
				{...menuProps}
			>
				<WordInput
					close={() => {
						menuProps.onMenuToggle('wordEditor');
					}}
					selection={selection}
				/>
			</ToolbarMenu>
			<Divider
				type="vertical"
				style={{
					margin: '0 0px !important',
					borderLeft: '1px solid rgb(0 0 0 / 27%)',
				}}
			/>
			<AlignButton
				align="left"
				icon={<AlignLeftOutlined />}
				title="Left Align"
				{...sharedProps}
			/>
			<AlignButton
				align="center"
				icon={<AlignCenterOutlined />}
				title="Center Align"
				{...sharedProps}
			/>
			<AlignButton
				align="right"
				icon={<AlignRightOutlined />}
				title="Right Align"
				{...sharedProps}
			/>
			<Divider
				type="vertical"
				style={{
					margin: '0 0px !important',
					borderLeft: '1px solid rgb(0 0 0 / 27%)',
				}}
			/>
			<ListButton
				type="numberedList"
				icon={<OrderedListOutlined />}
				title="Numbered List"
				{...sharedProps}
			/>
			<ListButton
				type="bulletedList"
				icon={<UnorderedListOutlined />}
				title="Numbered List"
				{...sharedProps}
			/>
			<Divider
				type="vertical"
				style={{
					margin: '0 0px !important',
					borderLeft: '1px solid rgb(0 0 0 / 27%)',
				}}
			/>
			<ToolbarMenu
				type="color"
				icon={<FontColorsOutlined />}
				title="Font Color"
				{...menuProps}
			>
				{Object.entries(TextColors).map(([color, colorProps]) => (
					<ColorButton
						color={color}
						key={color}
						title={`${colorProps.title} (${
							colorProps.hotkey || 'No shortcut'
						})`}
						icon="font"
						{...sharedProps}
					/>
				))}
			</ToolbarMenu>
			<Divider
				type="vertical"
				style={{
					margin: '0 0px !important',
					borderLeft: '1px solid rgb(0 0 0 / 27%)',
				}}
			/>
			<ToolbarButton
				icon={<UndoOutlined />}
				title="Undo"
				action={() => {}}
			/>
			<ToolbarButton
				icon={<RedoOutlined />}
				title="Redo"
				action={() => {}}
			/>
		</div>
	);
};

export default Toolbar;
