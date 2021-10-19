import './DictPopup.css';
import React from 'react';
import { Divider, List } from 'antd';
import DictionaryEntry from '@components/DictionaryEntry/DictionaryEntry';
import { IDictionaryEntryResolved } from 'Document/Dictionary';

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
			{entry && (
				<List
					grid={{
						gutter: 0,
						column: 1,
					}}
					dataSource={[entry]}
					renderItem={(entryItem) => (
						<List.Item key={entryItem.key}>
							{entry && <DictionaryEntry entry={entryItem} />}
							{rootEntry && (
								<>
									<Divider
										style={{
											marginTop: '1px',
											marginBottom: '5px',
										}}
									/>
									<DictionaryEntry entry={rootEntry} />
								</>
							)}
						</List.Item>
					)}
				/>
			)}
		</div>
	);
};

export default DictPopup;
