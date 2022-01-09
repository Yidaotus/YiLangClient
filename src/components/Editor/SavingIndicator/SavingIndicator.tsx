import './SavingIndicator.css';
import React from 'react';
import { Box, Alert, Snackbar, CircularProgress } from '@mui/material';

export type SavingState = 'LOADING' | 'SUCCESS' | 'ERROR' | 'IDLE';

const SavingIndicator: React.FC<{ savingState: SavingState }> = ({
	savingState,
}) => (
	<Snackbar
		open={savingState !== 'IDLE'}
		anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
	>
		<Box>
			{savingState === 'LOADING' && (
				<Alert
					icon={<CircularProgress size={20} />}
					severity="info"
					sx={{ width: '100%' }}
				>
					Saving document...
				</Alert>
			)}
			{savingState === 'ERROR' && (
				<Alert severity="error" sx={{ width: '100%' }}>
					Something went wrong
				</Alert>
			)}
			{savingState === 'SUCCESS' && (
				<Alert severity="success" sx={{ width: '100%' }}>
					Document saved
				</Alert>
			)}
		</Box>
	</Snackbar>
);

export default SavingIndicator;
