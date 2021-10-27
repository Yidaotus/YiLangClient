import './Toolbar.css';
import React, { useRef, useState } from 'react';
import { useSlateStatic } from 'slate-react';
import { BaseSelection } from 'slate';
import {
	AlignCenterOutlined,
	AlignLeftOutlined,
	AlignRightOutlined,
	ArrowDownOutlined,
	FontColorsOutlined,
	HighlightOutlined,
	LineOutlined,
	OrderedListOutlined,
	PicCenterOutlined,
	RedoOutlined,
	TranslationOutlined,
	UndoOutlined,
	UnorderedListOutlined,
} from '@ant-design/icons';
import { Divider } from 'antd';
import useClickOutside from '@hooks/useClickOutside';
import WordInput from './Modals/WordEditor/WordEditor';
import AlignButton from './Tools/AlignButton';
import ListButton from './Tools/ListButton';
import ToolbarButton from './Tools/ToolbarButton';
import ToolbarMenu from './Tools/ToolbarMenu';
import TextColors from './TextColors';
import ColorButton from './Tools/ColorButton';
import BlockButton from './Tools/BlockButton';
import { isNodeAtSelection } from '../CustomEditor';
import InsertButton from './Tools/InsertButton';
import ElementButton from './Tools/ElementButton';

export interface IToolbarProps {
	selection: BaseSelection;
	showWordEditor: () => void;
}

const Toolbar: React.FC<IToolbarProps> = ({ selection, showWordEditor }) => {
	const editor = useSlateStatic();
	const toolbarRef = useRef(null);
	const [menus, setMenus] = useState<Record<string, boolean>>({});

	useClickOutside(toolbarRef, () => {
		setMenus({});
	});

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
			setMenus({ [type]: !menus[type] });
		},
	};

	const wordNodeSelected = isNodeAtSelection(
		editor,
		editor.selection,
		'word'
	);

	return (
		<div
			className="toolbar"
			ref={toolbarRef}
			role="none"
			onMouseDown={(e) => {
				e.preventDefault();
			}}
		>
			<ToolbarButton
				icon={<TranslationOutlined />}
				title="wordEditor"
				action={() => {
					if (!wordNodeSelected) {
						showWordEditor();
					}
				}}
			/>
			<ElementButton
				type="sentence"
				title="Sentence"
				icon={<LineOutlined />}
				createElement={() => ({
					type: 'sentence',
					translation: '',
					children: [],
				})}
				{...sharedProps}
			/>
			<ElementButton
				type="mark"
				title="Mark"
				icon={<HighlightOutlined />}
				createElement={() => ({
					type: 'mark',
					color: 'green',
					children: [],
				})}
				{...sharedProps}
			/>
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
			<ToolbarMenu
				type="blockType"
				icon={<PicCenterOutlined />}
				title="Block Type"
				{...menuProps}
			>
				<BlockButton
					type="title"
					title="Title"
					{...sharedProps}
					icon="Title"
				/>
				<BlockButton
					type="subtitle"
					title="Subtitle"
					{...sharedProps}
					icon="Subtitle"
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
			</ToolbarMenu>
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
						color={colorProps.color}
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
			<ToolbarMenu
				type="glyphs"
				icon={<ArrowDownOutlined />}
				title="Font Color"
				{...menuProps}
			>
				<InsertButton text="←" title="Left Arrow" {...sharedProps} />
				<InsertButton text="→" title="Right Arrow" {...sharedProps} />
				<InsertButton
					text="↔"
					title="Left Right Arrow"
					{...sharedProps}
				/>
				<InsertButton
					text="⇐"
					title="Leftwards Double Arrow"
					{...sharedProps}
				/>
				<InsertButton
					text="⇒"
					title="Rightwards Double Arrow"
					{...sharedProps}
				/>
				<InsertButton text="…" title="Ellipsis" {...sharedProps} />
				<InsertButton
					text="«"
					title="Double Low Quote"
					{...sharedProps}
				/>
				<InsertButton
					text="»"
					title="Double High Quote"
					{...sharedProps}
				/>
				<InsertButton
					text="„"
					title="Double Angle Left Quote"
					{...sharedProps}
				/>
				<InsertButton
					text="”"
					title="Double Angle Right Quote"
					{...sharedProps}
				/>
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
				action={() => {
					editor.undo();
				}}
			/>
			<ToolbarButton
				icon={<RedoOutlined />}
				title="Redo"
				action={() => {
					editor.redo();
				}}
			/>
		</div>
	);
};

export default Toolbar;
