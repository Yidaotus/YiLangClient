import './EditorDocument.css';
import React, { useState, useRef } from 'react';
import { Empty, Button, Tooltip, Select } from 'antd';
import {
	MinusCircleOutlined,
	PlusCircleOutlined,
	TranslationOutlined,
	ArrowDownOutlined,
} from '@ant-design/icons';
import useSelectedText from '@hooks/useSelectedText';
import { useDispatch, useSelector } from 'react-redux';
import { DocumentNormalized, IEditorState } from '@store/editor/types';
import { changeLayer, toggleSpelling } from '@store/editor/actions';
import BlockContainer from '@editor/Blocks/BlockContainer/BlockContainer';
import Toolbar from '@editor/Toolbar/Toolbar';
import DropEdge from '@editor/Blocks/DropEdge/DropEdge';
import { selectAvailableLayers } from '@store/editor/selectors';
import { IRootState } from '@store/index';
import { getUUID } from 'Document/UUID';
import DictPopupController from './Popups/DictPopupController';
import SentencePopupController from './Popups/SentencePopupController';

const { Option } = Select;

export interface IEditorOption {
	name: string;
	icon: React.ReactNode;
	handler: () => void;
	tooltip: string;
}

export interface IEditorBlocksProps {
	editorDocument: IEditorState;
}

interface IEditorDocumentProps {
	document: DocumentNormalized;
}

/**
 * Render the passed document.
 *
 * @param editorDocument The document to render.
 */
const EditorDocument: React.FC<IEditorDocumentProps> = ({ document }) => {
	const [fontSize, setFontSize] = useState(1.3);
	const dispatch = useDispatch();

	const availableLayers = useSelector(selectAvailableLayers);
	const activeLayer = useSelector(
		(state: IRootState) => state.editor.selectedFragmentLayer
	);
	const editorContainer = useRef<HTMLDivElement | null>(null);
	useSelectedText(editorContainer);
	const { renderMap } = document;

	const options: IEditorOption[] = [
		{
			name: 'fontSizeIncrease',
			icon: <PlusCircleOutlined />,
			handler: () => {
				setFontSize((currentFontSize) => currentFontSize + 0.1);
			},
			tooltip: 'Increase font size',
		},
		{
			name: 'fontSizeDecrease',
			icon: <MinusCircleOutlined />,
			handler: () => {
				setFontSize((currentFontSize) => currentFontSize - 0.1);
			},
			tooltip: 'Decrease font size',
		},
		{
			name: 'toggleSpelling',
			icon: <TranslationOutlined />,
			handler: () => {
				dispatch(toggleSpelling());
			},
			tooltip: 'Toggle spelling visibility',
		},
	];

	const renderWidthFractions = new Set<number>();

	// TODO Unreadable code!
	if (!renderMap) {
		return <></>;
	}

	for (const row of renderMap) {
		let columnWidth = 0;
		for (const renderEntry of row) {
			const scalar = renderEntry.scale ? renderEntry.scale : 1;
			columnWidth += scalar;
		}
		renderWidthFractions.add(columnWidth);
	}

	const renderedMap = renderMap.map((row, y) => {
		const columnWidth = row.reduce((accu, entry) => accu + entry.scale, 0);
		const rowKey = y * 20;
		const renderedRow = (
			<React.Fragment key={rowKey}>
				<div className="block-row">
					<>
						{row.map((renderEntry, x) => {
							const cssCalcWidth = `calc(100% * ${renderEntry.scale}/${columnWidth})`;
							const renderCell =
								renderEntry.type === 'block' ? (
									<div
										style={{
											width: cssCalcWidth,
										}}
									>
										<BlockContainer
											fontSize={fontSize}
											rowIndex={y}
											columnIndex={x}
											isSplitRow={row.length > 1}
											blockId={renderEntry.id}
										/>
									</div>
								) : (
									<div
										style={{
											// custom-ident can't start with a number
											border: '2px dashed #c1c1c1',
											width: cssCalcWidth,
										}}
									>
										<Empty
											image={Empty.PRESENTED_IMAGE_SIMPLE}
											description={false}
										/>
									</div>
								);
							return (
								<React.Fragment key={renderEntry.id}>
									<DropEdge
										rowIndex={y}
										columnIndex={x}
										type="vertical"
									/>
									{renderCell}
								</React.Fragment>
							);
						})}
						<DropEdge
							rowIndex={y}
							columnIndex={row.length + 1}
							type="vertical"
							key={`RenderEdge${rowKey}`}
						/>
					</>
				</div>
				<div className="block-row">
					<div style={{ width: '100%' }}>
						<DropEdge
							columnIndex={0}
							rowIndex={y + 1}
							type="horizontal"
						/>
					</div>
				</div>
			</React.Fragment>
		);
		return renderedRow;
	});

	return (
		<div style={{ position: 'relative' }}>
			<div className="editor-options-panel">
				<Select
					defaultValue={activeLayer || ''}
					style={{ width: 160 }}
					onChange={(id) => {
						dispatch(changeLayer(getUUID(id as string)));
					}}
				>
					{availableLayers.map((layer) => (
						<Option value={layer.id} key={layer.id}>
							{layer.name}
						</Option>
					))}
				</Select>
				{options.map((option) => (
					<Tooltip
						title={option.tooltip}
						key={option.name}
						placement="bottom"
					>
						<Button
							shape="circle"
							type="text"
							size="large"
							icon={option.icon}
							onClick={option.handler}
						/>
					</Tooltip>
				))}
			</div>
			<Toolbar />
			<div ref={editorContainer}>
				<SentencePopupController />
				<DictPopupController />
				{Object.values(renderMap).length < 1 ? (
					<Empty
						key="Empty"
						image={Empty.PRESENTED_IMAGE_SIMPLE}
						description={
							<>
								<p>Add a block to start</p>
								<ArrowDownOutlined
									style={{ fontSize: '1.8em' }}
								/>
							</>
						}
					/>
				) : (
					<>
						<DropEdge
							columnIndex={0}
							rowIndex={0}
							type="horizontal"
						/>
						{renderedMap}
					</>
				)}
			</div>
		</div>
	);
};

export default React.memo(EditorDocument);
