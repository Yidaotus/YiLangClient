import React, { ReactNode } from 'react';
import { Box } from '@mui/material';

interface SRSCardProps {
	side: 'Front' | 'Back';
	children?: ReactNode;
}

const SRSCard: React.FC<SRSCardProps> = ({ children, side }) => {
	return <Box>{children}</Box>;
};

export default SRSCard;
