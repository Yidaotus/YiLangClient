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
import { TextField } from '@mui/material';
import { Resizable } from 're-resizable';

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
		(captionInput) => {
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
		(event) => {
			if (!isHotkey('enter', event)) {
				return;
			}

			applyCaptionChange(event.target.value);
			setIsEditingCaption(false);
		},
		[applyCaptionChange, setIsEditingCaption]
	);

	const onCaptionChange = useCallback(
		(event) => {
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
		<div {...attributes}>
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
				<Resizable
					size={{ width, height: '100%' }}
					maxWidth="100%"
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
					minWidth={100}
					className="resize-group"
				>
					<img
						alt="yilang-image-container"
						src={element.src}
						style={{
							display: 'block',
							maxWidth: '100%',
							paddingLeft: '0px',
							paddingRight: '0px',
							cursor: 'pointer',
							width: '100%',
							borderRadius: '3px',
							objectFit: 'cover',
							boxShadow:
								selected && focused
									? '0 0 0 3px #B4D5FF'
									: 'none',
						}}
						width={width}
					/>
				</Resizable>
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
		</div>
	);
};

export default ImageBlock;
