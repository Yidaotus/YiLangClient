import './Dictionary.css';
import React from 'react';
import DictionaryTable from '@components/DictionaryList/DictionaryTable';
import { Box, Paper } from '@mui/material';

/**
 * Renders the Dictionary into a Table.
 *
 * Let's the user filter tags, and search other columns
 */
const Dictionary: React.FC = () => {
	return (
		<Box sx={{ width: '100%' }}>
			<Paper sx={{ width: '100%', mb: 2 }}>
				<DictionaryTable />
			</Paper>
		</Box>
	);
};

export default Dictionary;
