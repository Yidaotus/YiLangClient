import React from 'react';
import { EditorBlockElement, YiEditor } from '@components/Editor/YiEditor';
import { Editor } from 'slate';
import ToolbarButton, { IToolbarItem } from './ToolbarButton';

export interface IToolbarWrapperItem extends IToolbarItem {
	type: EditorBlockElement['type'];
	editor: Editor;
	toolbarChanged: () => void;
	className?: string;
	blockProperties?: Record<string, unknown>;
}

const WrapperItem: React.FC<IToolbarWrapperItem> = ({
	type,
	icon,
	title,
	editor,
	toolbarChanged,
	className,
	blockProperties,
}): JSX.Element => {
	const isActive = YiEditor.getTextBlockStyle(editor) === type;

	return (
		<ToolbarButton
			tooltip={title}
			title={title}
			action={() => {
				YiEditor.toggleBlockType(
					editor,
					type,
					undefined,
					blockProperties
				);
				toolbarChanged();
			}}
			active={isActive}
			icon={icon}
			className={className}
		/>
	);
};

export default WrapperItem;
