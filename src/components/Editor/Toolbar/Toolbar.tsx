import './Toolbar.css';
import React, { useRef, useState } from 'react';
import { useSlateStatic } from 'slate-react';
import {
	BaseSelection,
	Editor,
	Element as SlateElement,
	Node as SlateNode,
	Range as SlateRange,
	Transforms,
} from 'slate';
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
	SearchOutlined,
} from '@ant-design/icons';
import { Divider } from 'antd';
import useClickOutside from '@hooks/useClickOutside';
import { useLookupSources } from '@hooks/ConfigQueryHooks';
import LookupSourceButton from '@components/LookupSourceButton';
import {
	DialogElement,
	EditorElement,
	toggleBlockType,
} from '@editor/CustomEditor';

import AlignButton from './Tools/AlignButton';
import ListButton from './Tools/ListButton';
import ToolbarButton from './Tools/ToolbarButton';
import ToolbarMenu from './Tools/ToolbarMenu';
import TextColors from './TextColors';
import ColorButton from './Tools/ColorButton';
import BlockButton from './Tools/BlockButton';
import InsertButton from './Tools/InsertButton';
import ElementButton from './Tools/ElementButton';
import InputWrapperButton from './Tools/InputWrapperButton';

export interface IToolbarProps {
	selection: BaseSelection;
	showWordEditor: () => void;
	showSentenceEditor: () => void;
}

const Toolbar: React.FC<IToolbarProps> = ({
	selection,
	showWordEditor,
	showSentenceEditor,
}) => {
	const editor = useSlateStatic();
	const toolbarRef = useRef(null);
	const [menus, setMenus] = useState<Record<string, boolean>>({});
	const lookupSources = useLookupSources();

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

	const lookupButtonActive =
		!!editor.selection && !SlateRange.isCollapsed(editor.selection);

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
				title="333333"
				action={() => {
					if (editor.selection) {
						const currentTexts: Array<[string, string]> = [];
						const [start, end] = SlateRange.edges(editor.selection);
						const startTopLevelBlockIndex = start.path[0];
						const endTopLevelBlockIndex = end.path[0];

						let currentLevelIndex = startTopLevelBlockIndex;
						while (currentLevelIndex <= endTopLevelBlockIndex) {
							const text = Editor.string(editor, [
								currentLevelIndex,
							]);
							if (text) {
								const splits = text.split(':');
								if (splits.length === 2) {
									currentTexts.push([splits[0], splits[1]]);
								} else {
									currentTexts.push(['', text]);
								}
							}
							currentLevelIndex++;
						}

						Transforms.removeNodes(editor);
						Transforms.move(editor, { reverse: true });

						const dialogNode: DialogElement = {
							type: 'dialog',
							children: currentTexts.map(([actor, speech]) => ({
								type: 'dialogLine',
								children: [
									{
										type: 'dialogLineActor',
										children: [{ text: actor }],
									},
									{
										type: 'dialogLineSpeech',
										children: [{ text: speech }],
									},
								],
							})),
						};
						Transforms.insertNodes(editor, dialogNode, {
							at: [startTopLevelBlockIndex],
						});
						console.log(currentTexts);
					}
				}}
				enabled
				icon="DEBUG3"
			/>
			<ToolbarButton
				title="DEBUG2"
				action={() => {
					if (editor.selection) {
						Transforms.unwrapNodes(editor, {
							match: (n) =>
								!Editor.isEditor(n) &&
								SlateElement.isElement(n) &&
								n.type === 'dialog',
							split: true,
						});
						toggleBlockType(editor, 'paragraph', true);
						const [parent, parentPath] = Editor.parent(
							editor,
							editor.selection
						);
						const topLevel = editor.selection.anchor.path[0];
						const text = Editor.string(editor, [topLevel]);
						Transforms.removeNodes(editor, { at: [topLevel] });
						Transforms.insertNodes(
							editor,
							{
								type: 'paragraph',
								align: 'left',
								children: [{ text }],
							},
							{ at: [topLevel] }
						);
						Transforms.move(editor, { reverse: true });
					}
				}}
				enabled
				icon="DEBUG2"
			/>
			<ToolbarButton
				title="DEBUG"
				action={() => {
					const dialogNode: DialogElement = {
						type: 'dialog',
						children: [
							{
								type: 'dialogLine',
								children: [
									{
										type: 'dialogLineActor',
										children: [{ text: 'Mikasa' }],
									},
									{
										type: 'dialogLineSpeech',
										children: [
											{ text: 'Hey its me Mikasa' },
										],
									},
								],
							},
							{
								type: 'dialogLine',
								children: [
									{
										type: 'dialogLineActor',
										children: [{ text: 'Robert' }],
									},
									{
										type: 'dialogLineSpeech',
										children: [{ text: 'And Im Robert!' }],
									},
								],
							},
						],
					};
					Transforms.insertNodes(editor, dialogNode);
				}}
				enabled
				active
				icon="DEBUG"
			/>
			<InputWrapperButton
				showInput={showWordEditor}
				icon={<TranslationOutlined />}
				title="Word"
				type="word"
				{...sharedProps}
			/>
			<InputWrapperButton
				showInput={showSentenceEditor}
				type="sentence"
				title="Sentence"
				icon={<LineOutlined />}
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
			<ToolbarMenu
				flow="vertical"
				type="lookup"
				icon={<SearchOutlined />}
				title="Lookup Word"
				enabled={lookupButtonActive}
				{...menuProps}
			>
				{lookupSources.map((luSource) => (
					<LookupSourceButton source={luSource} />
				))}
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
			<ToolbarMenu
				type="blockType"
				icon={<PicCenterOutlined />}
				title="Block Type"
				{...menuProps}
			>
				<BlockButton
					type="dialog"
					title="Dialog"
					{...sharedProps}
					icon="Dialog"
				/>
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
