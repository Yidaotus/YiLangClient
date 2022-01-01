import './Toolbar.css';
import React, { useRef, useState } from 'react';
import { useSlateStatic } from 'slate-react';
import { BaseSelection, Range as SlateRange } from 'slate';
import useClickOutside from '@hooks/useClickOutside';
import { useLookupSources } from '@hooks/ConfigQueryHooks';
import LookupSourceButton from '@components/LookupSourceButton';
import DialogButton from '@editor/Toolbar/Tools/DialogButton';
import { Divider } from '@mui/material';
import {
	Adb as AdbIcon,
	FormatAlignCenter,
	FormatAlignLeft,
	FormatAlignRight,
	FormatColorFill,
	FormatListBulleted,
	FormatListNumbered,
	FormatColorText,
	DriveFileRenameOutline,
	Translate as TranslateIcon,
	Bookmark as BookmarkIcon,
	Widgets as WidgetsIcon,
	Search as SearchIcon,
	Save as SaveIcon,
	Undo as UndoIcon,
	Redo as RedoIcon,
	EmojiSymbols as EmojiSymbolsIcon,
} from '@mui/icons-material';

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
	isEditorDirty: boolean;
}

const Toolbar: React.FC<IToolbarProps> = ({
	selection,
	showWordEditor,
	showSentenceEditor,
	updateDocument,
	isEditorDirty,
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
		onChange: () => {},
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
				icon={<AdbIcon />}
			/>
			<InputWrapperButton
				showInput={showWordEditor}
				icon={<TranslateIcon />}
				title="Word"
				type="word"
				{...sharedProps}
			/>
			<InputWrapperButton
				showInput={showSentenceEditor}
				type="sentence"
				title="Sentence"
				icon={<DriveFileRenameOutline />}
				{...sharedProps}
			/>
			<ElementButton
				type="mark"
				title="Mark"
				icon={<BookmarkIcon />}
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
				icon={<SearchIcon />}
				title="Lookup Word"
				enabled={lookupButtonActive}
				{...menuProps}
			>
				{lookupSources.map((luSource) => (
					<LookupSourceButton source={luSource} key={luSource.name} />
				))}
			</ToolbarMenu>
			<Divider orientation="vertical" flexItem />
			<AlignButton
				align="left"
				icon={<FormatAlignLeft />}
				title="Left Align"
				{...sharedProps}
			/>
			<AlignButton
				align="center"
				icon={<FormatAlignCenter />}
				title="Center Align"
				{...sharedProps}
			/>
			<AlignButton
				align="right"
				icon={<FormatAlignRight />}
				title="Right Align"
				{...sharedProps}
			/>
			<Divider orientation="vertical" flexItem />
			<ToolbarMenu
				type="blockType"
				icon={<WidgetsIcon />}
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
			<Divider orientation="vertical" flexItem />
			<ToolbarMenu
				type="color"
				icon={<FormatColorText />}
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
						{...sharedProps}
					/>
				))}
			</ToolbarMenu>
			<Divider orientation="vertical" flexItem />
			<ToolbarMenu
				type="glyphs"
				icon={<EmojiSymbolsIcon />}
				title="Glyphs"
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
			<Divider orientation="vertical" flexItem />
			<ToolbarButton
				icon={<UndoIcon />}
				tooltip="Undo"
				title="Undo"
				action={() => {
					editor.undo();
				}}
			/>
			<ToolbarButton
				icon={<RedoIcon />}
				title="Redo"
				tooltip="Redo"
				action={() => {
					editor.redo();
				}}
			/>
			<ToolbarButton
				icon={<SaveIcon />}
				title="Save"
				tooltip="Save"
				action={() => {
					updateDocument();
				}}
				enabled={isEditorDirty}
			/>
		</div>
	);
};

export default Toolbar;
