import './PageHeader.css';
import React from 'react';
import { Colors } from '@blueprintjs/core';

export interface IPageHeaderProps {
	title: string;
	subtitle: string;
	options?: React.ReactNode;
}

const PageHeader: React.FC<IPageHeaderProps> = ({
	title,
	subtitle,
	options,
}) => (
	<div className="page-header-container">
		<h2
			className="bp3-heading page-header-title"
			style={{ color: Colors.DARK_GRAY2 }}
		>
			{title}
		</h2>
		<h3
			className="bp3-heading page-header-subtitle"
			style={{ color: Colors.DARK_GRAY5 }}
		>
			{subtitle}
		</h3>
		<div className="page-header-options">{options}</div>
	</div>
);

export default PageHeader;
