import { Box } from '@mui/material';
import React, { CSSProperties, useEffect, useRef } from 'react';
import { ReactEditor, useSlateStatic } from 'slate-react';

const FloatingToolbar: React.FC = () => {
	const editor = useSlateStatic();
	const styleRef = useRef({
		x: 0,
		y: 0,
		width: '100px',
		height: '100px',
	});

	useEffect(() => {
		if (editor.selection) {
			const domPos = ReactEditor.toDOMRange(editor, editor.selection);
			const rect = domPos.getBoundingClientRect();
			styleRef.current = {
				x: rect.x,
				y: rect.y,
				width: '100px',
				height: '100px',
			};
		}
	}, [editor, editor.selection]);

	return <div style={styleRef.current}>Hi</div>;
};

export default FloatingToolbar;
