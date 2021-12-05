import './DictPopup.css';
import React from 'react';
import DictionaryEntry from '@components/DictionaryEntry/DictionaryEntry';
import { IDictionaryEntryResolved } from 'Document/Dictionary';
import { Divider } from '@blueprintjs/core';

export interface IDictPopupProps {
	entry: IDictionaryEntryResolved | null;
}

const DictPopup: React.FC<IDictPopupProps> = ({ entry }) => {
	return (
		<div
			className="dictpopup-container"
			role="none"
			onMouseDown={(e) => {
				e.preventDefault();
			}}
		>
			{entry && <DictionaryEntry entryId={entry.id} />}
			{entry?.root.map((rootEntry) => (
				<React.Fragment key={rootEntry}>
					<Divider />
					<DictionaryEntry entryId={rootEntry} />
				</React.Fragment>
			))}
		</div>
	);
};

export default DictPopup;
