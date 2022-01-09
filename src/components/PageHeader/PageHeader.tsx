import './PageHeader.css';
import React from 'react';
import { Card, Box, CardContent, Typography } from '@mui/material';

export interface IPageHeaderProps {
	title: string | React.ReactElement;
	subtitle: string;
	options?: React.ReactNode;
}

const PageHeader: React.FC<IPageHeaderProps> = ({
	title,
	subtitle,
	options,
}) => (
	<Card
		sx={{
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'space-between',
		}}
	>
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
			}}
		>
			<CardContent sx={{ flex: '1 0 auto' }}>
				<Typography component="div" variant="h5">
					{title}
				</Typography>
				<Typography
					variant="subtitle1"
					color="text.secondary"
					component="div"
				>
					{subtitle}
				</Typography>
			</CardContent>
		</Box>
		<Box sx={{ p: 2 }}>{options}</Box>
	</Card>
);

export default PageHeader;
