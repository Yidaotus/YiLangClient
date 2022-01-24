import React from 'react';
import { YiEditor } from '@components/Editor/YiEditor';
import { Editor } from 'slate';
import ToolbarButton, { IToolbarItem } from './ToolbarButton';

export interface IToolbarWrapperItem extends IToolbarItem {
	editor: Editor;
	toolbarChanged: () => void;
	className?: string;
}

const ImageButton: React.FC<IToolbarWrapperItem> = ({
	icon,
	title,
	editor,
	toolbarChanged,
	className,
}): JSX.Element => {
	const isActive = YiEditor.getTextBlockStyle(editor) === 'image';

	return (
		<ToolbarButton
			tooltip={title}
			title={title}
			action={() => {
				const imgUrl = window.prompt('Enter the image URL');
				if (imgUrl) {
					YiEditor.toggleBlockType<'image'>(editor, 'image', false, {
						caption: 'testImage',
						src: imgUrl,
						align: 'center',
						width: 10,
					});
					toolbarChanged();
				}
			}}
			active={isActive}
			icon={icon}
			className={className}
		/>
	);
};

export default ImageButton;
