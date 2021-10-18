import './DictionarySelect.css';
import React, { useMemo, useState } from 'react';
import useDebounce from '@hooks/useDebounce';
import { Button, Empty, Select, SelectProps, Spin } from 'antd';
import {
	IDictionaryEntry,
	IDictionaryEntryResolved,
} from 'Document/Dictionary';
import { UUID } from 'Document/UUID';
import useSearchDictionary from '@hooks/useSearchDictionary';

export interface IRootSelectProps extends SelectProps<IDictionaryEntry | UUID> {
	placeholder: string;
	createRoot?: (input: string) => void;
}

const entryLabel = (entry: IDictionaryEntryResolved | IDictionaryEntry) => (
	<div className="entry-preview">
		<div className="entry-preview-item">
			<span>{entry.key}</span>
			{entry.spelling && (
				<span className="entry-preview-spelling">{entry.spelling}</span>
			)}
		</div>
		<div className="entry-preview-item">{entry.translations.join(',')}</div>
	</div>
);

const DictionarySelect: React.FC<IRootSelectProps> = ({
	createRoot,
	value,
	placeholder,
	onChange,
}) => {
	const [wordSearchInput, setWordSearchInput] = useState('');
	const debouncedSeach = useDebounce(wordSearchInput, 500);
	const [searching, searchEntries] = useSearchDictionary(debouncedSeach);

	const rootOptions = useMemo(() => {
		const searchOptions = searchEntries.map((searchEntry) => ({
			value: searchEntry.id,
			label: entryLabel(searchEntry),
		}));
		if (typeof value === 'object') {
			rootOptions.push({
				value: value.id,
				label: entryLabel(value),
			});
		}
		return searchOptions;
	}, [searchEntries, value]);

	return (
		<Select
			loading={searching}
			placeholder={placeholder}
			onChange={onChange}
			value={typeof value === 'object' ? value.id : value}
			notFoundContent={
				searching ? (
					<Spin
						className="content-not-found-spinner"
						size="default"
					/>
				) : (
					<div>
						<Empty
							image={Empty.PRESENTED_IMAGE_SIMPLE}
							imageStyle={{
								height: 50,
							}}
							description={
								wordSearchInput &&
								`${wordSearchInput} not found!`
							}
						>
							{!!createRoot && wordSearchInput.length > 0 && (
								<Button
									type="primary"
									onClick={() => createRoot(wordSearchInput)}
								>
									Create Root
								</Button>
							)}
						</Empty>
					</div>
				)
			}
			options={rootOptions}
			className="search-autocomplete"
			searchValue={wordSearchInput}
			onSearch={(e) => {
				setWordSearchInput(e);
			}}
			filterOption={false}
			showSearch
			allowClear
		/>
	);
};

export default DictionarySelect;
