import './DictPopup.css';
import React from 'react';

import { Divider, List } from 'antd';

import { UUID } from 'Document/UUID';
import { useSelector } from 'react-redux';
import { IRootState, StoreMap } from 'store';
import {
	IDictionaryEntry,
	IDictionaryEntryResolved,
	IDictionaryTag,
} from 'Document/Dictionary';
import { notUndefined } from 'Document/Utility';
import DictEntry from '@components/DictionaryEntry/DictionaryEntry';
import Floating, { FloatingState } from './Floating';

export interface IDictPopupProps {
	dictId: UUID | null;
	popupState: FloatingState;
}

const DictPopup: React.FC<IDictPopupProps> = ({ dictId, popupState }) => {
	const userDictionary = useSelector<IRootState, StoreMap<IDictionaryEntry>>(
		(state) => state.dictionary.entries
	);

	const userTags = useSelector<IRootState, StoreMap<IDictionaryTag>>(
		(state) => state.dictionary.tags
	);

	let resolvedDictEntry: IDictionaryEntryResolved | null = null;
	if (dictId) {
		const dictEntry = userDictionary[dictId];
		const entryTags =
			dictEntry?.tags.map((id) => userTags[id]).filter(notUndefined) ||
			[];
		if (dictEntry && entryTags) {
			resolvedDictEntry = {
				...dictEntry,
				root: undefined,
				tags: entryTags,
			};
		}
		if (resolvedDictEntry && dictEntry?.root) {
			const rootEntry = userDictionary[dictEntry.root];
			const rootTags =
				rootEntry?.tags
					.map((id) => userTags[id])
					.filter(notUndefined) || [];

			if (rootEntry && rootTags) {
				const resolvedRootEntry = {
					...rootEntry,
					root: undefined,
					tags: rootTags,
				};
				resolvedDictEntry.root = resolvedRootEntry;
			}
		}
	}

	return (
		<Floating state={popupState} arrow>
			{resolvedDictEntry && (
				<div className="dictpopup-container">
					<List
						grid={{
							gutter: 0,
							column: 1,
						}}
						dataSource={[resolvedDictEntry]}
						renderItem={(entry) => (
							<List.Item key={entry.key}>
								{!!resolvedDictEntry && (
									<DictEntry dictEntry={resolvedDictEntry} />
								)}

								{!!resolvedDictEntry?.root && (
									<>
										<Divider
											style={{
												marginTop: '1px',
												marginBottom: '5px',
											}}
										/>
										<DictEntry
											dictEntry={resolvedDictEntry.root}
										/>
									</>
								)}
							</List.Item>
						)}
					/>
				</div>
			)}
		</Floating>
	);
};

export default DictPopup;
