import { Box } from '@mui/material';
import React from 'react';

interface SRSCardProps {
	side: 'Front' | 'Back';
}

const SRSCard: React.FC<SRSCardProps> = ({ children, side }) => {
	return <Box>{children}</Box>;
};

export default SRSCard;
