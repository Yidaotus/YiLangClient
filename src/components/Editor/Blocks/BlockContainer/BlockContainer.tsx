import './BlockContainer.css';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { RenderElementProps } from 'slate-react';
import BlockContainerMenu from './BlockContainerMenu/BlockContainerMenu';

export const BLOCKDATAID = 'block';

interface IBlockProps {
	fontSize: number;
	renderProps: RenderElementProps;
}

/**
 * Generic container for any type of block.
 *
 * @param blockId id of the block to host
 * @param fontSize the fontSize for the given block
 * @param children the contents to render (the block itself)
 */
const BlockContainer: React.FC<IBlockProps> = ({
	fontSize,
	renderProps,
}): JSX.Element => {
	const { children, attributes } = renderProps;
	const [menuIndicatorVisible, setMenuIndicatorVisible] = useState(false);

	/*
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
				/*
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
	*/

	return (
		<div
			style={{
				fontSize: `${fontSize}em`,
				position: 'relative',
			}}
			onMouseEnter={() => setMenuIndicatorVisible(true)}
			onMouseLeave={() => setMenuIndicatorVisible(false)}
			className="block-container"
			{...attributes}
		>
			{children}
			<div className="block-menu">
				{menuIndicatorVisible && <BlockContainerMenu />}
			</div>
		</div>
	);
};

export default React.memo(BlockContainer);
