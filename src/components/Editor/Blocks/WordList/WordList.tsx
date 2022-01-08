import './WordList.css';
import React from 'react';
import { RenderElementProps, useSlate } from 'slate-react';
import { Box } from '@mui/material';
import WordListTable from './WordListTable';

const WordList: React.FC<RenderElementProps> = ({ children, attributes }) => {
	const editor = useSlate();

	return (
		<Box
			{...attributes}
			onDragStart={(e) => {
				e.preventDefault();
			}}
			style={{
				padding: '5px',
				borderRadius: '5px',
			}}
		>
			{children}
			<div contentEditable={false} style={{ fontSize: '0.95rem' }}>
				<WordListTable editor={editor} />
			</div>
		</Box>
	);
};

export default React.memo(WordList);
