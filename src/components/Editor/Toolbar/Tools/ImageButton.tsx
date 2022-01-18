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
				YiEditor.toggleBlockType<'image'>(editor, 'image', false, {
					caption: 'testImage',
					src: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80',
					align: 'center',
					width: 10,
				});
				toolbarChanged();
			}}
			active={isActive}
			icon={icon}
			className={className}
		/>
	);
};

export default ImageButton;
