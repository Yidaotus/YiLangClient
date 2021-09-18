import './DropEdge.css';
import React from 'react';
import { useDrop } from 'react-dnd';
import { useDispatch } from 'react-redux';
import { addEmptyMapRow, moveBlockEntry } from 'store/editor/actions';

export interface IDropEdgeProps {
	rowIndex: number;
	columnIndex: number;
	type: 'vertical' | 'horizontal';
}

const DropEdge: React.FC<IDropEdgeProps> = ({
	rowIndex,
	columnIndex,
	type,
}): JSX.Element => {
	const dispatch = useDispatch();

	const [{ isOver, canDrop }, drop] = useDrop(
		{
			accept: 'BLOCK',
			// TODO Pull out item type to one spot so sender and reciever have the same type infos
			canDrop: (item: {
				column: number;
				row: number;
				isSplitRow: boolean;
			}) => {
				if (type === 'horizontal') {
					if (item.isSplitRow) {
						return true;
					}
					return item.row !== rowIndex && item.row + 1 !== rowIndex;
				}
				return item.row !== rowIndex;
			},
			drop: (item) => {
				let currentRow = item.row;
				const currentColumn = item.column;
				if (type === 'horizontal') {
					dispatch(addEmptyMapRow(rowIndex));
					if (rowIndex - 1 < currentRow) {
						currentRow += 1;
					}
				}
				dispatch(
					moveBlockEntry({
						currentRow,
						currentColumn,
						targetRow: rowIndex,
						targetColumn: columnIndex,
					})
				);
			},
			collect: (monitor) => ({
				isOver: !!monitor.isOver(),
				canDrop: !!monitor.canDrop(),
			}),
		},
		[dispatch, columnIndex, rowIndex]
	);

	let dividerClasses = 'divider';
	if (canDrop) {
		dividerClasses += ` divider-${type}-active`;
	}
	if (canDrop && isOver) {
		dividerClasses += ` divider-${type}-over`;
	}

	return (
		<div ref={drop} className={`divider-container-${type}`}>
			<div className={dividerClasses} />
		</div>
	);
};

export default DropEdge;
