import './WrapperItem.css';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { Button, Tooltip } from 'antd';
import { FragmentType } from 'Document/Fragment';
import React, { useCallback, useRef, useState } from 'react';
import useClickOutside from '@hooks/useClickOutside';
import { IToolbarItem } from './ToolbarItem';

export interface IToolbarWrapperItem extends IToolbarItem {
	type: 'Wrapper';
	tooltipActive: string;
	wrap: () => Promise<void>;
	unwrap: () => Promise<void>;
	fragmentType: FragmentType;
	active: boolean;
}

const WrapperItem: React.FC<IToolbarWrapperItem> = ({
	name,
	icon,
	tooltip,
	options,
	active,
	tooltipActive,
	visible,
	wrap,
	unwrap,
}): JSX.Element => {
	const [optionsVisible, setOptionsVisible] = useState(false);
	const optionsContainer = useRef(null);

	const clickOutsideHandler = useCallback(() => {
		setOptionsVisible(false);
	}, [setOptionsVisible]);
	useClickOutside(optionsContainer, clickOutsideHandler);

	return (
		<div style={{ display: `${visible ? 'block' : 'none'}` }}>
			<Tooltip
				title={active ? tooltipActive : tooltip}
				key={name}
				mouseEnterDelay={1}
			>
				<Button
					type={active ? 'primary' : 'default'}
					style={{
						fill: active ? 'white' : 'black',
					}}
					onMouseUp={async () => {
						if (active) {
							await unwrap();
						} else {
							await wrap();
						}
					}}
				>
					{icon}
				</Button>
				{options && (
					<Button
						style={{ width: '15px' }}
						className="wrapper-item-dropdown-button"
						onClick={() => {
							setOptionsVisible((visibleState) => !visibleState);
						}}
						icon={
							optionsVisible ? <UpOutlined /> : <DownOutlined />
						}
					/>
				)}
				{optionsVisible && (
					<div
						ref={optionsContainer}
						className="wrapper-options-container"
					>
						{options}
					</div>
				)}
			</Tooltip>
		</div>
	);
};

export default WrapperItem;
