import './DictionarySelect.css';
import React, { useEffect, useState, useCallback } from 'react';
import useDebounce from '@hooks/useDebounce';
import { StoreMap } from '@store/index';
import { Button, Empty, Select, SelectProps, Spin } from 'antd';
import { getEntry, searchDictionary } from 'api/dictionary.service';
import { IDictionaryEntry } from 'Document/Dictionary';
import { notUndefined } from 'Document/Utility';
import { UUID } from 'Document/UUID';
import { useSelector } from 'react-redux';
import { selectActiveLanguageConfig } from '@store/user/selectors';
import handleError from '@helpers/Error';

export interface IRootSelectProps extends SelectProps<IDictionaryEntry | UUID> {
	placeholder: string;
	createRoot?: (input: string) => void;
	localDictionary?: StoreMap<IDictionaryEntry>;
}

const entryLabel = (entry: IDictionaryEntry) => (
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
	localDictionary,
	value,
	placeholder,
	onChange,
}) => {
	const [wordSearchInput, setWordSearchInput] = useState('');
	const [loading, setLoading] = useState(false);
	const [initialized, setInitialized] = useState(false);
	const debouncedSeach = useDebounce(wordSearchInput, 500);
	const [rootOptions, setRootOptions] = useState<
		SelectProps<Record<string, IDictionaryEntry>>['options']
	>([]);
	const selectedLanguage = useSelector(selectActiveLanguageConfig);

	const fetchEntries = useCallback(
		async (searchTerm: string) => {
			let options: SelectProps<Record<string, unknown>>['options'] = [];
			if (!searchTerm) {
				setLoading(false);
				return;
			}

			try {
				if (!selectedLanguage) {
					throw new Error('No language selected!');
				}
				const cachHitEntries = Object.values(
					localDictionary || {}
				).filter((entry) => {
					return (
						entry &&
						entry.key
							.toLowerCase()
							.includes(searchTerm.toLowerCase())
					);
				});
				let foundEntries: Array<IDictionaryEntry> = [];
				if (cachHitEntries && cachHitEntries.length > 0) {
					foundEntries = cachHitEntries.filter(notUndefined);
				}

				const serverEntries = await searchDictionary({
					lang: selectedLanguage.key,
					key: searchTerm,
				});
				if (serverEntries) {
					foundEntries = [
						...foundEntries,
						...serverEntries.filter(notUndefined),
					];
				}
				if (foundEntries) {
					options = foundEntries.map((entry) => ({
						value: entry.id,
						label: entryLabel(entry),
					}));
					setRootOptions(options);
				}
			} catch (e) {
				handleError(e);
			}
			setLoading(false);
		},
		[localDictionary, selectedLanguage]
	);

	const findValueById = useCallback(
		async (id: UUID) => {
			try {
				if (!selectedLanguage) {
					throw new Error('No language selected!');
				}

				let foundEntry;
				const foundLocalEntry = (localDictionary || {})[id];
				if (foundLocalEntry) {
					foundEntry = foundLocalEntry;
				} else {
					const remoteEntry = await getEntry({
						id,
						language: selectedLanguage.key,
					});
					foundEntry = remoteEntry.entry;
				}
				setRootOptions([
					{
						value: foundEntry.id,
						label: entryLabel(foundEntry),
					},
				]);
			} catch (e) {
				handleError(e);
			}
		},
		[localDictionary, selectedLanguage]
	);

	useEffect(() => {
		fetchEntries(debouncedSeach);
	}, [debouncedSeach, fetchEntries]);

	useEffect(() => {
		const initializeValue = async () => {
			if (value && !initialized) {
				if (typeof value === 'object') {
					setRootOptions([
						{
							value: value.id,
							label: entryLabel(value),
						},
					]);
				} else {
					setLoading(true);
					try {
						await findValueById(value);
					} catch (e) {
						handleError(e);
					}
					setLoading(false);
				}
				setInitialized(true);
			}
		};
		initializeValue();
	}, [findValueById, initialized, rootOptions, value]);

	return (
		<Select
			loading={loading}
			placeholder={placeholder}
			onChange={onChange}
			value={typeof value === 'object' ? value.id : value}
			notFoundContent={
				loading ? (
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
				if (e) {
					setLoading(true);
					setRootOptions([]);
				} else {
					setLoading(false);
				}
			}}
			filterOption={false}
			showSearch
			allowClear
		/>
	);
};

export default DictionarySelect;
