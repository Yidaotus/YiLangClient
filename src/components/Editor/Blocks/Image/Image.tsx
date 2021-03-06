import './Image.css';
import React, { useCallback, useEffect, useState } from 'react';
import {
	ReactEditor,
	RenderElementProps,
	useFocused,
	useSelected,
	useSlateStatic,
} from 'slate-react';
import { ImageElement } from '@components/Editor/YiEditor';
import { Transforms } from 'slate';
import isHotkey from 'is-hotkey';
import { Resizable } from 're-resizable';
import DragContainer from '@components/Editor/DragContainer';
import { Box, TextField, useTheme } from '@mui/material';

export type IImageBlockData = Omit<RenderElementProps, 'element'> & {
	element: ImageElement;
};

interface ResizeHandleProps {
	position: 'left' | 'right';
}

const ResizeHandle: React.FC<ResizeHandleProps> = ({ position }) => {
	const positionStyles =
		position === 'right'
			? {
					alignItems: 'end',
					right: '-.75rem',
			  }
			: {
					left: '-.75rem',
			  };
	return (
		<div
			className="image-handle"
			style={{
				...positionStyles,
			}}
		/>
	);
};

/**
 * Renders a simple image.
 *
 * @param source source of the image to render
 * @param title title of the image rendered at the bottom of the block
 */
const ImageBlock: React.FC<IImageBlockData> = ({
	element,
	children,
	attributes,
}) => {
	const [isEditingCaption, setIsEditingCaption] = useState(false);
	const [captionEdit, setCaptionEdit] = useState(element.caption || '');
	const [width, setWidth] = useState(element.width);
	const editor = useSlateStatic();
	const selected = useSelected();
	const focused = useFocused();
	const uiTheme = useTheme();

	useEffect(() => {
		setWidth(element.width);
	}, [element.width]);

	const applyNodeWith = useCallback(
		(w: number) => {
			const path = ReactEditor.findPath(editor, element);

			if (w === element.width) {
				Transforms.select(editor, path);
			} else {
				Transforms.setNodes(editor, { width: w }, { at: path });
			}
		},
		[editor, element]
	);

	const applyCaptionChange = useCallback(
		(captionInput: string) => {
			const path = ReactEditor.findPath(editor, element);

			Transforms.setNodes(
				editor,
				{ caption: captionInput },
				{ at: path }
			);
		},
		[editor, element]
	);

	const onKeyDown = useCallback(
		(event: React.KeyboardEvent<HTMLDivElement>) => {
			if (!isHotkey('enter', event)) {
				return;
			}

			if (event.currentTarget.nodeValue) {
				applyCaptionChange(event.currentTarget.nodeValue);
			}
			setIsEditingCaption(false);
		},
		[applyCaptionChange, setIsEditingCaption]
	);

	const onCaptionChange = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			setCaptionEdit(event.target.value);
		},
		[setCaptionEdit]
	);

	const onToggleCaptionEditMode = useCallback(() => {
		const wasEditing = isEditingCaption;
		setIsEditingCaption(!isEditingCaption);
		if (wasEditing) {
			applyCaptionChange(captionEdit);
		}
	}, [isEditingCaption, applyCaptionChange, captionEdit]);

	return (
		<Box {...attributes}>
			<DragContainer element={element}>
				{children}
				<div
					contentEditable={false}
					style={{
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						justifyContent: 'center',
						marginTop: '15px',
						marginBottom: '15px',
					}}
				>
					<Box
						sx={(theme) => ({
							position: 'relative',
							maxWidth: '100%',
							width: '100%',
							display: 'flex',
							justifyContent: 'center',
							alignItems: 'center',
							'&:active .image-handle::after': {
								opacity: '100%',
								backgroundColor: theme.palette.primary.main,
							},
							'&:focus .image-handle::after': {
								opacity: '100%',
								backgroundColor: theme.palette.primary.main,
							},
							'&:hover .image-handle::after': {
								opacity: '100%',
								backgroundColor: theme.palette.primary.main,
							},
						})}
					>
						<Resizable
							size={{ width, height: '100%' }}
							maxWidth="103%"
							lockAspectRatio
							resizeRatio={2}
							handleComponent={{
								left: <ResizeHandle position="left" />,
								right: <ResizeHandle position="right" />,
							}}
							enable={{
								left: true,
								right: true,
							}}
							onResize={(e, direction, ref) => {
								setWidth(ref.offsetWidth);
							}}
							onResizeStop={(e, direction, ref) =>
								applyNodeWith(ref.offsetWidth)
							}
							minWidth={200}
						>
							<img
								alt="yilang-image-container"
								src={element.src}
								draggable={false}
								style={{
									display: 'block',
									maxWidth: '100%',
									paddingLeft: '0px',
									paddingRight: '0px',
									cursor: 'pointer',
									width: '100%',
									borderRadius: '3px',
									objectFit: 'cover',
									border: '1px solid lightgray',
									boxShadow:
										selected && focused
											? `0 0 0 1px ${uiTheme.palette.primary.dark}`
											: 'none',
								}}
								width={width}
							/>
						</Resizable>
					</Box>
					{isEditingCaption && (
						<TextField
							autoFocus
							type="text"
							defaultValue={element.caption}
							onKeyDown={onKeyDown}
							onChange={onCaptionChange}
							variant="standard"
							onBlur={onToggleCaptionEditMode}
							inputProps={{ style: { textAlign: 'center' } }}
							placeholder="Caption"
							size="small"
							sx={{ width: '80%', pt: 1 }}
						/>
					)}
					{!isEditingCaption && element.caption && (
						<div
							style={{
								margin: 'auto',
								textAlign: 'center',
								marginBottom: '10px',
								color: 'lightgray',
							}}
							role="none"
							onClick={onToggleCaptionEditMode}
						>
							{element.caption}
						</div>
					)}
					{selected && !isEditingCaption && !element.caption && (
						<div
							style={{
								margin: 'auto',
								textAlign: 'center',
								marginBottom: '10px',
								color: 'lightgray',
							}}
							role="none"
							onClick={onToggleCaptionEditMode}
						>
							Edit your caption
						</div>
					)}
				</div>
			</DragContainer>
		</Box>
	);
};

export default ImageBlock;
