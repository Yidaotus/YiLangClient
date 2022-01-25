import { Box } from '@mui/material';
import React, { CSSProperties, useEffect, useRef } from 'react';
import { ReactEditor, useSlateStatic } from 'slate-react';

const FloatingToolbar: React.FC = () => {
	const editor = useSlateStatic();
	const containerRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		if (editor.selection) {
			const domPos = ReactEditor.toDOMRange(editor, editor.selection);
			const rect = domPos.getBoundingClientRect();
			const newStyle = {
				x: rect.x,
				y: rect.y,
				width: '100px',
				height: '100px',
			};
			const el = document.getElementById('lul123');
			if (el) {
				el.style.left = rect.x.toString();
				el.style.top = rect.y.toString();
			}
		}
	}, [editor, editor.selection]);

	useEffect(() => {
		const updater = (ev: Event) => {
			if (editor.selection) {
				const domPos = ReactEditor.toDOMRange(editor, editor.selection);
				const rect = domPos.getBoundingClientRect();
				const el = document.getElementById('lul123');
				if (el) {
					el.style.left = `${rect.x.toString()}px`;
					el.style.top = `${rect.y.toString()}px`;
				}
			}
		};
		document.onselectionchange = updater;

		return () => {
			document.onselectionchange = null;
		};
	});

	return (
		<div
			ref={containerRef}
			id="lul123"
			style={{
				position: 'absolute',
				width: '100px',
				height: '100px',
				backgroundColor: 'black',
				color: 'white',
			}}
		>
			Hi
		</div>
	);
};

export default FloatingToolbar;
