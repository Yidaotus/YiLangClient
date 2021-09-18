import {
	DragOutlined,
	UpOutlined,
	DownOutlined,
	DeleteOutlined,
	MoreOutlined,
} from '@ant-design/icons';
import {
	scaleMapEntry,
	removeBlock,
	configureBlock,
} from '@store/editor/actions';
import { DocumentBlockNormalized } from '@store/editor/types';
import { Button, Popover, Space, Tooltip, Popconfirm } from 'antd';
import React from 'react';
import { ConnectDragSource } from 'react-dnd';
import { useDispatch } from 'react-redux';
import { configuratorMap } from '@components/Editor/Blocks/Elements';

interface IContainerMenuProps {
	block: DocumentBlockNormalized;
	drag: ConnectDragSource;
}

const BlockContainerMenu: React.FC<IContainerMenuProps> = ({ block, drag }) => {
	const dispatch = useDispatch();

	const blockConfigurators = configuratorMap[block.type]
		? configuratorMap[block.type]
		: [];

	return (
		<div>
			<Button type="link" icon={<DragOutlined />} ref={drag} />
			<Popover
				placement="left"
				trigger="click"
				content={
					<Space direction="vertical">
						<Space direction="horizontal">
							<Tooltip title="Scale up" placement="bottom">
								<Button
									size="small"
									shape="circle"
									icon={<UpOutlined />}
									onClick={() =>
										dispatch(
											scaleMapEntry({
												id: block.id,
												mode: 'up',
											})
										)
									}
								/>
							</Tooltip>
							<Tooltip title="Scale down" placement="bottom">
								<Button
									size="small"
									shape="circle"
									icon={<DownOutlined />}
									onClick={() =>
										dispatch(
											scaleMapEntry({
												id: block.id,
												mode: 'down',
											})
										)
									}
								/>
							</Tooltip>
							<Tooltip title="Delete" placement="bottom">
								<Popconfirm
									title="Are you sure？"
									placement="bottom"
									okText="Yes"
									cancelText="No"
									onConfirm={() =>
										dispatch(removeBlock(block.id))
									}
								>
									<Button
										type="primary"
										size="small"
										danger
										shape="circle"
										icon={<DeleteOutlined />}
									/>
								</Popconfirm>
							</Tooltip>
						</Space>
						<Space direction="horizontal">
							{blockConfigurators?.map((configurator) => (
								<Tooltip
									title={configurator.title}
									key={configurator.title}
								>
									<Button
										size="small"
										shape="circle"
										icon={configurator.icon}
										onClick={() =>
											dispatch(
												configureBlock({
													configurator,
													blockId: block.id,
												})
											)
										}
									/>
								</Tooltip>
							))}
						</Space>
					</Space>
				}
			>
				<Button
					icon={<MoreOutlined className="icon-highlight" />}
					type="dashed"
					shape="round"
					size="small"
				/>
			</Popover>
		</div>
	);
};

export default BlockContainerMenu;
