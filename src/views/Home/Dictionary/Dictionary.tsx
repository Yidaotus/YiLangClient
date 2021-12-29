import './Dictionary.css';
import React, { useRef, useState } from 'react';
import DictionaryTable from '@components/DictionaryList/DictionaryTable';
import handleError from '@helpers/Error';
import InnerModal from '@components/InnerModal/InnerModal';
import { useActiveLanguageConf } from '@hooks/ConfigQueryHooks';
import PageHeader from '@components/PageHeader/PageHeader';
import { Box, Paper, Button } from '@mui/material';

/**
 * Renders the Dictionary into a Table.
 *
 * Let's the user filter tags, and search other columns
 */
const Dictionary: React.FC = () => {
	const [newTagVisible, setNewTagVisible] = useState(false);
	const activeLanguage = useActiveLanguageConf();

	const createNewEntry = async () => {
		try {
			if (!activeLanguage) {
				throw new Error('No language selected!');
			}
		} catch (e) {
			handleError(e);
		}
	};

	return (
		<Box sx={{ width: '100%' }}>
			<Paper sx={{ width: '100%', mb: 2 }}>
				<DictionaryTable />
			</Paper>
		</Box>
	);
};

export default Dictionary;
