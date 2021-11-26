import './Toolbar.css';
import React, { useRef, useState } from 'react';
import { useSlateStatic } from 'slate-react';
import { BaseSelection, Editor, Range as SlateRange } from 'slate';
import useClickOutside from '@hooks/useClickOutside';
import { useLookupSources } from '@hooks/ConfigQueryHooks';
import LookupSourceButton from '@components/LookupSourceButton';
import DialogButton from '@editor/Toolbar/Tools/DialogButton';
import { Divider } from '@blueprintjs/core';

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
	updateDocument: () => void;
}

const Toolbar: React.FC<IToolbarProps> = ({
	selection,
	showWordEditor,
	showSentenceEditor,
	updateDocument,
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
				title="DEBUG"
				action={() => {}}
				enabled
				active
				icon="delta"
			/>
			<InputWrapperButton
				showInput={showWordEditor}
				icon="translate"
				title="Word"
				type="word"
				{...sharedProps}
			/>
			<InputWrapperButton
				showInput={showSentenceEditor}
				type="sentence"
				title="Sentence"
				icon="paragraph"
				{...sharedProps}
			/>
			<ElementButton
				type="mark"
				title="Mark"
				icon="annotation"
				createElement={() => ({
					type: 'mark',
					color: '#FFB30F',
					children: [],
				})}
				{...sharedProps}
			/>
			<ToolbarMenu
				flow="vertical"
				type="lookup"
				icon="search-text"
				title="Lookup Word"
				enabled={lookupButtonActive}
				{...menuProps}
			>
				{lookupSources.map((luSource) => (
					<LookupSourceButton source={luSource} />
				))}
			</ToolbarMenu>
			<Divider />
			<AlignButton
				align="left"
				icon="align-left"
				title="Left Align"
				{...sharedProps}
			/>
			<AlignButton
				align="center"
				icon="align-center"
				title="Center Align"
				{...sharedProps}
			/>
			<AlignButton
				align="right"
				icon="align-right"
				title="Right Align"
				{...sharedProps}
			/>
			<Divider />
			<ToolbarMenu
				type="blockType"
				icon="vertical-distribution"
				title="Block Type"
				{...menuProps}
			>
				<BlockButton
					type="wordList"
					title="Words and Sentences"
					{...sharedProps}
					icon="git-repo"
				/>
				<DialogButton icon="circle" title="Dialog" {...sharedProps} />
				<BlockButton
					type="title"
					title="Title"
					{...sharedProps}
					icon="header"
				/>
				<BlockButton
					type="subtitle"
					title="Subtitle"
					{...sharedProps}
					icon="header-two"
				/>
				<ListButton
					type="numberedList"
					icon="numbered-list"
					title="Numbered List"
					{...sharedProps}
				/>
				<ListButton
					type="bulletedList"
					icon="list"
					title="Numbered List"
					{...sharedProps}
				/>
			</ToolbarMenu>
			<Divider />
			<ToolbarMenu
				type="color"
				icon="highlight"
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
			<Divider />
			<ToolbarMenu
				type="glyphs"
				icon="arrow-down"
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
			<Divider />
			<ToolbarButton
				icon="undo"
				tooltip="undo"
				title="Undo"
				action={() => {
					editor.undo();
				}}
			/>
			<ToolbarButton
				icon="redo"
				title="Redo"
				tooltip="Redo"
				action={() => {
					editor.redo();
				}}
			/>
			<ToolbarButton
				icon="floppy-disk"
				title="Save"
				tooltip="Save"
				action={() => {
					updateDocument();
				}}
			/>
		</div>
	);
};

export default Toolbar;
