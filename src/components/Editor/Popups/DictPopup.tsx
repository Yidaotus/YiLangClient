import './DictPopup.css';
import React from 'react';
import DictionaryEntry from '@components/DictionaryEntry/DictionaryEntry';
import { IDictionaryEntryResolved } from 'Document/Dictionary';
import { Button, Divider, Menu, MenuItem, Position } from '@blueprintjs/core';
import { useLookupSources } from '@hooks/ConfigQueryHooks';
import { formatURL } from '@components/LookupSourceButton';
import { Popover2 } from '@blueprintjs/popover2';

export interface IDictPopupProps {
	entry: IDictionaryEntryResolved | null;
}

const WINDOW_TARGET = '_blank';

const DictPopup: React.FC<IDictPopupProps> = ({ entry }) => {
	const lookupSources = useLookupSources();

	const menu = (
		<Menu>
			{lookupSources.map((source) => (
				<MenuItem
					key={source.name}
					text={source.name}
					onClick={() => {
						const url = formatURL({
							source,
							searchTerm: entry?.key || '',
						});
						window.open(url, WINDOW_TARGET);
					}}
				/>
			))}
		</Menu>
	);

	return (
		<div
			className="dictpopup-container"
			role="none"
			onMouseDown={(e) => {
				e.preventDefault();
			}}
		>
			<div>
				<Popover2 content={menu} position={Position.BOTTOM}>
					<Button icon="search" minimal />
				</Popover2>
			</div>
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
