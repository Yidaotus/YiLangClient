import './DictPopup.css';
import React from 'react';
import DictionaryEntry from '@components/DictionaryEntry/DictionaryEntry';
import { IDictionaryEntryResolved } from 'Document/Dictionary';
import { Divider } from '@blueprintjs/core';

export interface IDictPopupProps {
	entry: IDictionaryEntryResolved | null;
	rootEntry: IDictionaryEntryResolved | null;
}

const DictPopup: React.FC<IDictPopupProps> = ({ entry, rootEntry }) => {
	return (
		<div
			className="dictpopup-container"
			role="none"
			onMouseDown={(e) => {
				e.preventDefault();
			}}
		>
			{entry && <DictionaryEntry entryId={entry.id} />}
			{rootEntry && (
				<>
					<Divider />
					<DictionaryEntry entryId={rootEntry.id} />
				</>
			)}
		</div>
	);
};

export default DictPopup;
