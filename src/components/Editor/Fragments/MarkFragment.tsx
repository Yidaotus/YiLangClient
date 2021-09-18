import { Tooltip } from 'antd';
import { IMarkFragmentData, ResolvedFragment } from 'Document/Fragment';
import React from 'react';
import FragmentElement from './FragmentElement';

const MarkFragment: React.FC<ResolvedFragment<IMarkFragmentData>> = ({
	id,
	data,
	fragmented,
	value,
}) => {
	const { comment, color } = data;
	return (
		<FragmentElement
			id={id}
			className={`mark-fragment ${
				fragmented === 'left' && 'mark-fragment-left'
			} ${fragmented === 'right' && 'mark-fragment-right'} ${
				comment && 'cursor-pointer'
			}`}
			style={{ background: color }}
			key={id}
		>
			{comment ? (
				<Tooltip
					color={color}
					title={<span className="text-black">{comment}</span>}
					trigger="click"
				>
					{value}
				</Tooltip>
			) : (
				value
			)}
		</FragmentElement>
	);
};

export default MarkFragment;
