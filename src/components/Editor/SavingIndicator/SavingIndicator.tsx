import './SavingIndicator.css';
import React from 'react';
import { Icon, Intent, Spinner } from '@blueprintjs/core';

export type SavingState = 'LOADING' | 'SUCCESS' | 'ERROR' | 'IDLE';

const SavingIndicator: React.FC<{ savingState: SavingState }> = ({
	savingState,
}) => {
	return savingState !== 'IDLE' ? (
		<div className="saving-indicator-container">
			{savingState === 'LOADING' && (
				<>
					<Spinner intent={Intent.PRIMARY} size={20} />
					<span>Saving document...</span>
				</>
			)}
			{savingState === 'ERROR' && (
				<>
					<Icon intent={Intent.WARNING} icon="error" />
					<span> Something went wrong!</span>
				</>
			)}
			{savingState === 'SUCCESS' && (
				<>
					<Icon intent={Intent.SUCCESS} icon="tick" />
					<span> Document saved</span>
				</>
			)}
		</div>
	) : null;
};

export default SavingIndicator;
