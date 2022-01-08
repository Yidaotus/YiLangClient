import './Toolbar.css';
import React, { useCallback, useRef, useState } from 'react';
import { useSlateStatic } from 'slate-react';
import { BaseSelection, Editor, Range as SlateRange } from 'slate';
import useClickOutside from '@hooks/useClickOutside';
import { useLookupSources } from '@hooks/ConfigQueryHooks';
import LookupSourceButton from '@components/LookupSourceButton';
import DialogButton from '@editor/Toolbar/Tools/DialogButton';
import { Divider, Paper, styled, ToggleButtonGroup } from '@mui/material';
import {
	FormatAlignCenter,
	FormatAlignLeft,
	FormatAlignRight,
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
	FormatListNumbered,
	FormatListBulleted,
	Title as TitleIcon,
	ChatBubble,
	ImportContacts,
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
import { useUpdateEditorDocument } from '@hooks/DocumentQueryHooks';
import { SavingState } from '../SavingIndicator/SavingIndicator';
import useUiErrorHandler from '@helpers/Error';

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
	'& .MuiToggleButtonGroup-grouped': {
		margin: theme.spacing(0.5),
		border: 0,
		'&.Mui-disabled': {
			border: 0,
		},
		'&:not(:first-of-type)': {
			marginLeft: 1,
			border: 0,
			borderRadius: theme.shape.borderRadius,
		},
		'&:first-of-type': {
			border: 0,
			borderRadius: theme.shape.borderRadius,
		},
	},
}));

export interface IToolbarProps {
	selection: BaseSelection;
	showWordEditor: () => void;
	showSentenceEditor: () => void;
	setShowSpelling: (show: boolean) => void;
	showSpelling: boolean;
	isEditorDirty: boolean;
	updateDocument: () => void;
}

const Toolbar: React.FC<IToolbarProps> = ({
	selection,
	showWordEditor,
	showSentenceEditor,
	showSpelling,
	setShowSpelling,
	isEditorDirty,
	updateDocument,
}) => {
	const editor = useSlateStatic();
	const toolbarRef = useRef(null);
	const lookupSources = useLookupSources();
	const [savingIndicator, setSavingIndicator] = useState<SavingState>('IDLE');
	const updateEditorDocument = useUpdateEditorDocument();
	const handleError = useUiErrorHandler();

	const updateDocument2 = useCallback(async () => {
		try {
			setSavingIndicator('LOADING');
			const title = Editor.string(editor, [0], { voids: true });
			const serializedDocument = JSON.stringify(editor.children);
			await updateEditorDocument.mutateAsync({
				id: 'what',
				title,
				serializedDocument,
			});

			// Hacky but feels better for the user to actually see the saving process
			setTimeout(() => {
				setSavingIndicator('SUCCESS');
				setTimeout(() => {
					setSavingIndicator('IDLE');
				}, 2000);
			}, 1000);
		} catch (error) {
			setSavingIndicator('ERROR');
			handleError(error);
		} finally {
			// setIsEditorDirty(false);
		}
	}, [editor, handleError, updateEditorDocument]);

	const sharedProps = {
		editor,
		selection,
		onChange: () => {},
	};

	const lookupButtonActive =
		!!editor.selection && !SlateRange.isCollapsed(editor.selection);

	return (
		<Paper
			elevation={0}
			sx={{
				display: 'flex',
				border: (theme) => `1px solid ${theme.palette.divider}`,
				flexWrap: 'wrap',
				justifyContent: 'center',
				position: 'sticky',
				top: '10px',
				zIndex: 15,
			}}
			onMouseDown={(e) => {
				e.preventDefault();
			}}
			ref={toolbarRef}
		>
			<StyledToggleButtonGroup
				size="small"
				exclusive
				value="none"
				aria-label="text alignment"
			>
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
					icon={<SearchIcon />}
					title="Lookup Word"
					enabled={lookupButtonActive}
				>
					{lookupSources.map((luSource) => (
						<LookupSourceButton
							source={luSource}
							key={luSource.name}
						/>
					))}
				</ToolbarMenu>
			</StyledToggleButtonGroup>

			<Divider flexItem orientation="vertical" sx={{ mx: 0.5, my: 1 }} />

			<StyledToggleButtonGroup
				size="small"
				exclusive
				value="none"
				aria-label="text alignment"
			>
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
			</StyledToggleButtonGroup>

			<Divider flexItem orientation="vertical" sx={{ mx: 0.5, my: 1 }} />

			<StyledToggleButtonGroup
				size="small"
				exclusive
				value="none"
				aria-label="text alignment"
			>
				<ToolbarMenu icon={<WidgetsIcon />} title="Block Type">
					<StyledToggleButtonGroup
						size="small"
						exclusive
						value="none"
						aria-label="text alignment"
					>
						<BlockButton
							type="wordList"
							title="Words and Sentences"
							{...sharedProps}
							icon={<ImportContacts />}
						/>
						<DialogButton
							icon={<ChatBubble />}
							title="Dialog"
							{...sharedProps}
						/>
						<BlockButton
							type="title"
							title="Title"
							{...sharedProps}
							icon={<TitleIcon />}
						/>
						<BlockButton
							type="subtitle"
							title="Subtitle"
							{...sharedProps}
							icon={<TitleIcon />}
						/>
						<ListButton
							type="numberedList"
							icon={<FormatListNumbered />}
							title="Numbered List"
							{...sharedProps}
						/>
						<ListButton
							type="bulletedList"
							icon={<FormatListBulleted />}
							title="Bulleted List"
							{...sharedProps}
						/>
					</StyledToggleButtonGroup>
				</ToolbarMenu>

				<ToolbarMenu icon={<FormatColorText />} title="Font Color">
					<StyledToggleButtonGroup
						size="small"
						exclusive
						value="none"
						aria-label="text alignment"
					>
						{Object.entries(TextColors).map(
							([color, colorProps]) => (
								<ColorButton
									color={colorProps.color}
									key={color}
									title={`${colorProps.title} (${
										colorProps.hotkey || 'No shortcut'
									})`}
									{...sharedProps}
								/>
							)
						)}
					</StyledToggleButtonGroup>
				</ToolbarMenu>

				<ToolbarMenu icon={<EmojiSymbolsIcon />} title="Glyphs">
					<StyledToggleButtonGroup
						size="small"
						exclusive
						value="none"
						aria-label="text alignment"
					>
						<InsertButton
							text="←"
							title="Left Arrow"
							{...sharedProps}
						/>
						<InsertButton
							text="→"
							title="Right Arrow"
							{...sharedProps}
						/>
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
						<InsertButton
							text="…"
							title="Ellipsis"
							{...sharedProps}
						/>
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
					</StyledToggleButtonGroup>
				</ToolbarMenu>
			</StyledToggleButtonGroup>

			<Divider flexItem orientation="vertical" sx={{ mx: 0.5, my: 1 }} />

			<StyledToggleButtonGroup
				size="small"
				exclusive
				value="none"
				aria-label="text alignment"
			>
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
				<ToolbarButton
					icon={<TranslateIcon />}
					title="Show Spellings"
					tooltip="Show Spellings"
					active={showSpelling}
					action={() => {
						setShowSpelling(!showSpelling);
					}}
					enabled
				/>
			</StyledToggleButtonGroup>
		</Paper>
	);
};

export default React.memo(Toolbar);
