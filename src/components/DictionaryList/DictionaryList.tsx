import './DictionaryList.css';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Button, Input, Space, Table, Tag } from 'antd';
import { ColumnsType, ColumnType } from 'antd/lib/table';
import { IDictionaryTag, IDictionaryEntryResolved } from 'Document/Dictionary';
import { SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import {
	FilterConfirmProps,
	FilterValue,
	SorterResult,
	TablePaginationConfig,
} from 'antd/lib/table/interface';
import { listDictionary } from 'api/dictionary.service';
import { notUndefined } from 'Document/Utility';
import { IListDictionaryParams } from 'api/definitions/api';
import { useHistory } from 'react-router-dom';
import Link from 'antd/lib/typography/Link';
import { selectActiveLanguageConfig } from '@store/user/selectors';
import handleError from '@helpers/Error';
import { getTags } from 'api/tags.service';

type ColumnSearchMap = {
	[key in keyof IDictionaryEntryResolved]?: string;
};
const INITIAL_PAGE_SIZE = 2;

/**
 * Renders the Dictionary into a Table.
 *
 * Let's the user filter tags, and search other columns
 */
const DictionaryList: React.FC = () => {
	const [loading, setLoading] = useState<string | null>(null);
	const [total, setTotal] = useState(0);
	const [pageSize, setPageSize] = useState(10);
	const [entries, setEntries] = useState<Array<IDictionaryEntryResolved>>([]);
	const [tags, setTags] = useState<Array<IDictionaryTag>>([]);

	const [columnSearch, setColumnSearch] = useState<ColumnSearchMap>({});

	const selectedLanguage = useSelector(selectActiveLanguageConfig);
	const searchInput = useRef<Input>(null);
	const history = useHistory();

	useEffect(() => {
		const fetch = async () => {
			if (!selectedLanguage) {
				return;
			}
			const tagData = await getTags(selectedLanguage.key);
			if (tagData) {
				setTags(tagData);
			}
		};
		fetch();
	}, [selectedLanguage]);

	const fetchEntries = useCallback(
		async ({
			pagination,
			filter,
			sortBy,
		}: {
			pagination: { skip: number; limit: number };
			filter?: Record<string, FilterValue | null>;
			sortBy?: { key: string; order: 'ascend' | 'descend' };
		}) => {
			setLoading('Loading Entries');
			try {
				if (!selectedLanguage) {
					return;
				}

				const list = await listDictionary({
					excerptLength: 0,
					skip: pagination.skip,
					limit: pagination.limit,
					lang: selectedLanguage.key,
					sortBy,
					filter,
				});

				const denormalizedEntries = list.entries.map((entry) => ({
					...entry,
					root: undefined,
					tags: entry.tags
						.map((tagId) => tags.find((tag) => tag.id === tagId))
						.filter(notUndefined),
				}));
				setEntries(denormalizedEntries);
				setTotal(list.total);
			} catch (e) {
				handleError(e);
			}

			setLoading(null);
		},
		[selectedLanguage, tags]
	);

	useEffect(() => {
		fetchEntries({ pagination: { skip: 0, limit: pageSize } });
	}, [fetchEntries, pageSize]);

	const tableChangeHandler = async (
		pagination: TablePaginationConfig,
		filters: Record<string, FilterValue | null>,
		sorter:
			| SorterResult<IDictionaryEntryResolved>
			| SorterResult<IDictionaryEntryResolved>[]
	) => {
		setLoading('Loading Entries');

		const skip = ((pagination.current || 1) - 1) * pageSize;
		const limit = pagination.pageSize || INITIAL_PAGE_SIZE;
		const filter = filters;
		let sortBy: IListDictionaryParams['sortBy'];
		if (!Array.isArray(sorter) && sorter.field && sorter.order) {
			sortBy = {
				key: sorter.field as string,
				order: sorter.order,
			};
		}

		fetchEntries({ pagination: { skip, limit }, filter, sortBy });
	};

	const handleSearch = (
		selectedKeys: React.Key[],
		confirm: (param?: FilterConfirmProps | undefined) => void,
		dataIndex: keyof IDictionaryEntryResolved
	) => {
		confirm();
		if (selectedKeys.length > 0) {
			setColumnSearch((current) => ({
				...current,
				[dataIndex]: selectedKeys[0].toString() || '',
			}));
		}
	};

	const handleReset = (
		clearFilters: (() => void) | undefined,
		dataIndex: keyof IDictionaryEntryResolved
	) => {
		clearFilters?.();
		setColumnSearch((current) => ({
			...current,
			[dataIndex]: undefined,
		}));
	};

	const getColumnSearchProps = (
		dataIndex: keyof IDictionaryEntryResolved
	): ColumnType<IDictionaryEntryResolved> => ({
		filterDropdown: ({
			setSelectedKeys,
			selectedKeys,
			confirm,
			clearFilters,
		}) => (
			<div style={{ padding: 8 }}>
				<Input
					ref={searchInput}
					placeholder={`Search ${dataIndex}`}
					value={selectedKeys[0]}
					onChange={(e) =>
						setSelectedKeys(e.target.value ? [e.target.value] : [])
					}
					onPressEnter={() => {
						if (selectedKeys[0]) {
							handleSearch(selectedKeys, confirm, dataIndex);
						} else {
							handleReset(clearFilters, dataIndex);
						}
					}}
					style={{ marginBottom: 8, display: 'block' }}
				/>
				<Space>
					<Button
						type="primary"
						onClick={() => {
							handleSearch(selectedKeys, confirm, dataIndex);
						}}
						icon={<SearchOutlined />}
						size="small"
						style={{ width: 90 }}
					>
						Search
					</Button>
					<Button
						onClick={() => handleReset(clearFilters, dataIndex)}
						size="small"
						style={{ width: 90 }}
					>
						Reset
					</Button>
				</Space>
			</div>
		),
		filterIcon: (filtered) => (
			<SearchOutlined
				style={{ color: filtered ? '#1890ff' : undefined }}
			/>
		),
		onFilterDropdownVisibleChange: (visible) => {
			if (visible) {
				setTimeout(() => searchInput.current?.select(), 100);
			}
		},
		render: (_, record) => {
			let renderText = ''; // record[dataIndex];
			switch (dataIndex) {
				case 'comment':
				case 'spelling':
				case 'key': {
					renderText = record[dataIndex] || '';
					break;
				}
				case 'translations': {
					renderText = record[dataIndex]?.join(', ') || '';
					break;
				}
				default:
					break;
			}

			if (columnSearch[dataIndex]) {
				if (dataIndex === 'key') {
					return (
						<Link
							onClick={() => {
								history.push(`/home/dictionary/${record.id}`);
							}}
						>
							<Highlighter
								highlightStyle={{
									backgroundColor: '#ffc069',
									padding: 0,
								}}
								searchWords={[columnSearch[dataIndex] || '']}
								autoEscape
								textToHighlight={renderText}
							/>
						</Link>
					);
				}
				return (
					<Highlighter
						highlightStyle={{
							backgroundColor: '#ffc069',
							padding: 0,
						}}
						searchWords={[columnSearch[dataIndex] || '']}
						autoEscape
						textToHighlight={renderText}
					/>
				);
			}

			if (dataIndex === 'key') {
				return (
					<Link
						onClick={() => {
							history.push(`/home/dictionary/${record.id}`);
						}}
					>
						{renderText}
					</Link>
				);
			}
			return renderText;
		},
	});

	const columns: ColumnsType<IDictionaryEntryResolved> = [
		{
			title: 'Word',
			key: 'key',
			dataIndex: 'key',
			sorter: true,
			...getColumnSearchProps('key'),
		},
		{
			title: 'Spelling',
			key: 'spelling',
			dataIndex: 'spelling',
			sorter: true,
			...getColumnSearchProps('spelling'),
		},
		{
			title: 'Translation',
			key: 'translations',
			dataIndex: 'translations',
			sorter: true,
			...getColumnSearchProps('translations'),
		},
		{
			title: 'Tags',
			key: 'tags',
			dataIndex: 'tags',
			render: (tagData: IDictionaryTag[]) =>
				tagData.map((tagEntry) => (
					<Tag key={tagEntry.id} color={tagEntry.color}>
						{tagEntry.name}
					</Tag>
				)),
			filters: tags.filter(notUndefined).map((tagEntry) => ({
				text: tagEntry.name,
				value: tagEntry.id,
			})),
		},
		{
			title: 'Comment',
			key: 'comment',
			dataIndex: 'comment',
			sorter: true,
			...getColumnSearchProps('comment'),
		},
		{
			title: 'Created',
			key: 'createdAt',
			dataIndex: 'createdAt',
			sorter: true,
			render: (text, record) => {
				if (record.createdAt) {
					return new Date(record.createdAt).toLocaleDateString();
				}
				return text;
			},
		},
	];

	return (
		<Table<IDictionaryEntryResolved>
			columns={columns}
			dataSource={entries}
			pagination={{
				position: ['bottomCenter'],
				onChange: (page, size) => {
					if (size) {
						setPageSize(size);
					}
				},
				pageSize,
				total,
				defaultCurrent: 1,
				defaultPageSize: 2,
			}}
			loading={!!loading}
			size="middle"
			onChange={(pagination, filters, sorter) => {
				tableChangeHandler(pagination, filters, sorter);
			}}
		/>
	);
};

export default DictionaryList;
