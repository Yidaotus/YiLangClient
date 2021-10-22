import './DictionaryList.css';

import React, { useRef, useState } from 'react';
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
import { notUndefined } from 'Document/Utility';
import { IListDictionaryParams } from 'api/definitions/api';
import { useHistory } from 'react-router-dom';
import Link from 'antd/lib/typography/Link';
import useDictionaryEntries from '@hooks/useDictionaryEntries';
import { useTags } from '@hooks/useTags';
import { useActiveLanguageConf } from '@hooks/useActiveLanguageConf';

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
	const [pageSize, setPageSize] = useState(10);
	const selectedLanguage = useActiveLanguageConf();
	const [paginationOptions, setPaginationOptions] =
		useState<IListDictionaryParams | null>({
			excerptLength: 80,
			lang: selectedLanguage?.key || 'jp',
			limit: 20,
			skip: 0,
		});
	const [loading, paginatedEntries] = useDictionaryEntries(paginationOptions);
	const tags = useTags();
	const [columnSearch, setColumnSearch] = useState<ColumnSearchMap>({});

	const searchInput = useRef<Input>(null);
	const history = useHistory();

	const tableChangeHandler = async (
		pagination: TablePaginationConfig,
		filters: Record<string, FilterValue | null>,
		sorter:
			| SorterResult<IDictionaryEntryResolved>
			| SorterResult<IDictionaryEntryResolved>[]
	) => {
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

		if (selectedLanguage) {
			setPaginationOptions({
				skip,
				limit,
				filter,
				sortBy,
				excerptLength: 80,
				lang: selectedLanguage?.key,
			});
		}
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
			dataSource={paginatedEntries.entries.map((entry) => ({
				...entry,
				tags: entry.tags
					.map((tagId) => tags.find((tag) => tag.id === tagId))
					.filter(notUndefined),
			}))}
			pagination={{
				position: ['bottomCenter'],
				onChange: (page, size) => {
					if (size) {
						setPageSize(size);
					}
				},
				pageSize,
				total: paginatedEntries.total,
				defaultCurrent: 1,
				defaultPageSize: 10,
			}}
			loading={loading}
			size="middle"
			onChange={(pagination, filters, sorter) => {
				tableChangeHandler(pagination, filters, sorter);
			}}
		/>
	);
};

export default DictionaryList;
