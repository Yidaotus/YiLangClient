import {
	UpOutlined,
	DownOutlined,
	DeleteOutlined,
	MoreOutlined,
} from '@ant-design/icons';
import { Button, Popover, Space, Tooltip, Popconfirm } from 'antd';
import React from 'react';

const BlockContainerMenu: React.FC = () => {
	return (
		<div>
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
									onClick={() => {}}
								/>
							</Tooltip>
							<Tooltip title="Scale down" placement="bottom">
								<Button
									size="small"
									shape="circle"
									icon={<DownOutlined />}
									onClick={() => {}}
								/>
							</Tooltip>
							<Tooltip title="Delete" placement="bottom">
								<Popconfirm
									title="Are you sure？"
									placement="bottom"
									okText="Yes"
									cancelText="No"
									onConfirm={() => {}}
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
						<Space direction="horizontal">test</Space>
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
