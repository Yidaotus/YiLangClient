import './Image.css';
import React, { useCallback, useState } from 'react';
import { Input } from 'antd';
import {
	RenderElementProps,
	useFocused,
	useSelected,
	useSlateStatic,
} from 'slate-react';
import { ImageElement } from '@components/Editor/CustomEditor';
import { Editor, Element as SlateElement, Transforms } from 'slate';
import isHotkey from 'is-hotkey';

export type IImageBlockData = Omit<RenderElementProps, 'element'> & {
	element: ImageElement;
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
	const editor = useSlateStatic();
	const selected = useSelected();
	const focused = useFocused();

	const applyCaptionChange = useCallback(
		(captionInput) => {
			const imageNodeEntry = Editor.above(editor, {
				match: (n) => SlateElement.isElement(n) && n.type === 'image',
			});
			if (imageNodeEntry == null) {
				return;
			}

			Transforms.setNodes(
				editor,
				{ caption: captionInput },
				{ at: imageNodeEntry[1] }
			);
		},
		[editor]
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
				style={{ marginTop: '15px', marginBottom: '15px' }}
			>
				<img
					alt="lul"
					src={element.src}
					style={{
						display: 'block',
						maxWidth: '100%',
						margin: 'auto',
						maxHeight: '20em',
						boxShadow:
							selected && focused ? '0 0 0 3px #B4D5FF' : 'none',
					}}
				/>
				{isEditingCaption ? (
					<Input
						autoFocus
						className="image-caption-input"
						type="text"
						defaultValue={element.caption}
						onKeyDown={onKeyDown}
						onChange={onCaptionChange}
						onBlur={onToggleCaptionEditMode}
						style={{ margin: 'auto', textAlign: 'center' }}
					/>
				) : (
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
			</div>
		</div>
	);
};

export default ImageBlock;
