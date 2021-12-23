import './DictPopup.css';
import React from 'react';
import DictionaryEntry from '@components/DictionaryEntry/DictionaryEntry';
import DictionaryRootEntry from '@components/DictionaryEntry/DictionaryRootEntry';
import { IDictionaryEntryResolved } from 'Document/Dictionary';
import { Divider } from '@blueprintjs/core';

export interface IDictPopupProps {
	entry: IDictionaryEntryResolved;
}

const DictPopup: React.FC<IDictPopupProps> = ({ entry }) => (
	<div
		className="dictpopup-container"
		role="none"
		onMouseDown={(e) => {
			e.preventDefault();
		}}
	>
		{entry && <DictionaryEntry entry={entry} />}
		{entry?.roots.map((rootEntry) => (
			<React.Fragment key={rootEntry.id}>
				<Divider />
				<DictionaryRootEntry entry={rootEntry} />
			</React.Fragment>
		))}
	</div>
);

export default DictPopup;
