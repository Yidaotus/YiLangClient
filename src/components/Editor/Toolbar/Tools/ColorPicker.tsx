import { UpOutlined, DownOutlined, HighlightOutlined } from '@ant-design/icons';
import {
	isNodeInSelection,
	MarkElement,
} from '@components/Editor/CustomEditor';
import HSLColorPicker from '@components/HSLColorPicker/HSLColorPicker';
import useClickOutside from '@hooks/useClickOutside';
import { Button, Tooltip } from 'antd';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Editor, Transforms, Element as SlateElement } from 'slate';

const tooltip = 'Mark a Word';
const icon = <HighlightOutlined />;
const ColorPicker: React.FC<{ editor: Editor }> = ({ editor }) => {
	const [optionsVisible, setOptionsVisible] = useState(false);
	const optionsContainer = useRef(null);
	const [selectedColorValue, setSelectedColorValue] = useState(0);
	const saturation = 40;
	const lightness = 80;
	const selectedColor = useMemo(() => {
		return `hsl(${selectedColorValue}, ${saturation}%, ${lightness}%)`;
	}, [selectedColorValue]);
	const isActive = isNodeInSelection(editor, editor.selection, 'mark');

	const wrap = useCallback(() => {
		if (editor.selection) {
			const vocab: MarkElement = {
				type: 'mark',
				color: selectedColor,
				children: [{ text: '' }],
			};
			Transforms.wrapNodes(editor, vocab, { split: true });
		}
	}, [editor, selectedColor]);

	const unwrap = useCallback(() => {
		Transforms.unwrapNodes(editor, {
			match: (n) => {
				return SlateElement.isElement(n) && n.type === 'mark';
			},
		});
	}, [editor]);

	return (
		<Tooltip title={tooltip} mouseEnterDelay={1}>
			<Button
				type={isActive ? 'primary' : 'default'}
				style={{
					fill: isActive ? 'white' : 'black',
				}}
				onMouseUp={async () => {
					if (isActive) {
						unwrap();
					} else {
						wrap();
					}
					setOptionsVisible(false);
				}}
			>
				{icon}
			</Button>
			<Button
				style={{ width: '15px' }}
				className="wrapper-item-dropdown-button"
				onClick={() => {
					setOptionsVisible((visibleState) => !visibleState);
				}}
				icon={optionsVisible ? <UpOutlined /> : <DownOutlined />}
			/>
			{optionsVisible && (
				<div
					ref={optionsContainer}
					role="none"
					className="wrapper-options-container"
					onMouseDown={(e) => {
						e.preventDefault();
					}}
					onClick={(e) => {
						e.preventDefault();
					}}
					style={{ width: '242px', height: '22px' }}
				>
					<HSLColorPicker
						value={selectedColorValue}
						onChange={setSelectedColorValue}
						saturation={saturation}
						lightness={lightness}
					/>
				</div>
			)}
		</Tooltip>
	);
};

export default ColorPicker;
