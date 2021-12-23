import React from 'react';
import { Transforms, Element as SlateElement } from 'slate';
import { ReactEditor, RenderElementProps, useSlateStatic } from 'slate-react';
import { CustomEditor, VideoElement } from '@components/Editor/YiEditor';

export type IVideoBlockData = Omit<RenderElementProps, 'element'> & {
	element: VideoElement;
};

const UrlInput = ({
	url,
	onChange,
}: {
	url: string;
	onChange: (newUrl: string) => void;
}) => {
	const [value, setValue] = React.useState(url);
	return (
		<input
			value={value}
			onClick={(e) => e.stopPropagation()}
			style={{
				marginTop: '5px',
				marginBottom: '15px',
				fontSize: '0.8rem',
				boxSizing: 'border-box',
				width: '100%',
			}}
			onChange={(e) => {
				const newUrl = e.target.value;
				setValue(newUrl);
				onChange(newUrl);
			}}
		/>
	);
};

const videoBlockPasteAction = (
	event: React.ClipboardEvent<HTMLDivElement>,
	editor: CustomEditor
): void => {
	const pastedText = event.clipboardData?.getData('text')?.trim();
	const isYouTubeLinkRegex =
		/^(?:(?:https?:)?\/\/)?(?:(?:www|m)\.)?(?:(?:youtube\.com|youtu.be))(?:\/(?:[\w-]+\?v=|embed\/|v\/)?)([\w-]+)(?:\S+)?$/;
	const isYouTubeLink = pastedText.match(isYouTubeLinkRegex);
	if (isYouTubeLink != null) {
		const [, videoId] = isYouTubeLink;
		const embedLink = `https://www.youtube.com/embed/${videoId}`;
		event.preventDefault();
		Transforms.insertNodes(editor, [
			{
				type: 'video',
				src: embedLink,
				children: [
					{
						text: '',
					},
				],
			},
		]);
	}
};

const VideoBlock: React.FC<IVideoBlockData> = ({
	element,
	children,
	attributes,
}) => {
	const editor = useSlateStatic();
	const { src } = element;
	return (
		<div {...attributes}>
			<div contentEditable={false}>
				<div
					style={{
						padding: '75% 0 0 0',
						position: 'relative',
					}}
				>
					<iframe
						title="Video iFrame"
						src={src}
						frameBorder="0"
						style={{
							position: 'absolute',
							top: '0',
							left: '0',
							width: '100%',
							height: '100%',
						}}
					/>
				</div>
				<UrlInput
					url={src}
					onChange={(val) => {
						const path = ReactEditor.findPath(editor, element);
						const newProperties: Partial<SlateElement> = {
							src: val,
						};
						Transforms.setNodes<SlateElement>(
							editor,
							newProperties,
							{
								at: path,
							}
						);
					}}
				/>
			</div>
			{children}
		</div>
	);
};

export default VideoBlock;
export { videoBlockPasteAction };
