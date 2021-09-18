import './BlockContainer.css';
import React, { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { UUID } from 'Document/UUID';
import { IRootState } from 'store';
import { DragPreviewImage, useDrag, useDrop } from 'react-dnd';
import { swapMapEntries } from '@store/editor/actions';
import { selectBlockById } from '@store/dictionary/selectors';
import DragIcon from '../DropEdge/DragIcon';
import Block from '../Block';
import BlockContainerMenu from './BlockContainerMenu/BlockContainerMenu';

export const BLOCKDATAID = 'block';

interface IBlockProps {
	blockId: UUID;
	fontSize: number;
	rowIndex: number;
	columnIndex: number;
	isSplitRow: boolean;
}

/**
 * Generic container for any type of block.
 *
 * @param blockId id of the block to host
 * @param fontSize the fontSize for the given block
 * @param children the contents to render (the block itself)
 */
const BlockContainer: React.FC<IBlockProps> = ({
	blockId,
	fontSize,
	rowIndex,
	columnIndex,
	isSplitRow,
}): JSX.Element => {
	const [menuIndicatorVisible, setMenuIndicatorVisible] = useState(false);
	const dispatch = useDispatch();

	const selectBlock = useMemo(selectBlockById, []);
	const block = useSelector((state: IRootState) =>
		selectBlock(state, blockId)
	);

	const [{ isDragging }, drag, preview] = useDrag(
		() => ({
			type: 'BLOCK',
			item: { row: rowIndex, column: columnIndex, isSplitRow },
			collect: (monitor) => ({
				isDragging: !!monitor.isDragging(),
			}),
		}),
		[rowIndex, columnIndex, isSplitRow]
	);

	const [{ isOver, canDrop }, drop] = useDrop(
		{
			accept: 'BLOCK',
			canDrop: (item: { column: number; row: number }) => {
				return item.column !== columnIndex || item.row !== rowIndex;
			},
			drop: (item) => {
				dispatch(
					swapMapEntries({
						sourceColumn: item.column,
						sourceRow: item.row,
						targetColumn: columnIndex,
						targetRow: rowIndex,
					})
				);
			},
			collect: (monitor) => ({
				isOver: monitor.isOver(),
				canDrop: monitor.canDrop(),
			}),
		},
		[dispatch, columnIndex, rowIndex]
	);

	if (!block) {
		return <></>;
	}

	return (
		<div
			data-type={BLOCKDATAID}
			data-id={block.id}
			style={{
				fontSize: `${fontSize}em`,
				position: 'relative',
				overflowWrap: 'break-word',
				border:
					canDrop && isOver
						? '2px dashed #40a9ff40'
						: '2px dashed white',
			}}
			onMouseEnter={() => setMenuIndicatorVisible(true)}
			onMouseLeave={() => setMenuIndicatorVisible(false)}
			className="block-container"
			ref={drop}
		>
			{isDragging && <div className="grey-overlay" />}
			{canDrop && isOver && <div className="blue-overlay" />}
			<div className="block-menu">
				{menuIndicatorVisible && (
					<BlockContainerMenu block={block} drag={drag} />
				)}
			</div>
			<Block block={block} />
			<DragPreviewImage connect={preview} src={DragIcon} />
		</div>
	);
};

export default React.memo(BlockContainer);
