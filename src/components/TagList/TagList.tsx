import './TagList.css';

import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IRootDispatch } from 'store';
import { Button, Dropdown, Input, Menu, Modal, Space, Table } from 'antd';
import { ColumnsType, ColumnType } from 'antd/lib/table';
import { IDictionaryTag } from 'Document/Dictionary';
import {
	DeleteOutlined,
	EditOutlined,
	ExclamationCircleOutlined,
	MoreOutlined,
	SearchOutlined,
} from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import { FilterConfirmProps } from 'antd/lib/table/interface';
import { GrammarPoint } from '@components/DictionaryEntry/DictionaryEntry';
import { UUID } from 'Document/UUID';
import { removeTag, removeTagRemote } from '@store/dictionary/actions';
import { selectActiveLanguageConfig } from '@store/user/selectors';
import { getTags } from 'api/tags.service';

const confirmModal = Modal.confirm;

type ColumnSearchMap = {
	[key in keyof IDictionaryTag]?: string;
};

/**
 * Renders the Tags into a Table.
 *
 */
const TagList: React.FC = () => {
	const [tags, setTags] = useState<Array<IDictionaryTag>>([]);
	const total = tags.length;
	const dispatch: IRootDispatch = useDispatch();
	const [pageSize, setPageSize] = useState(10);
	const [columnSearch, setColumnSearch] = useState<ColumnSearchMap>({});
	const selectedLanguage = useSelector(selectActiveLanguageConfig);

	const searchInput = useRef<Input>(null);

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

	const handleSearch = (
		selectedKeys: React.Key[],
		confirm: (param?: FilterConfirmProps | undefined) => void,
		dataIndex: keyof IDictionaryTag
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
		dataIndex: keyof IDictionaryTag
	) => {
		clearFilters?.();
		setColumnSearch((current) => ({
			...current,
			[dataIndex]: undefined,
		}));
	};

	const getColumnSearchProps = (
		dataIndex: keyof IDictionaryTag
	): ColumnType<IDictionaryTag> => ({
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
		onFilter: (value, record) =>
			record[dataIndex]
				? !!record[dataIndex]
						?.toString()
						.toLowerCase()
						.includes(String(value).toLowerCase())
				: false,
		onFilterDropdownVisibleChange: (visible) => {
			if (visible) {
				setTimeout(() => searchInput.current?.select(), 100);
			}
		},
		render: (text) => {
			if (columnSearch[dataIndex]) {
				return (
					<Highlighter
						highlightStyle={{
							backgroundColor: '#ffc069',
							padding: 0,
						}}
						searchWords={[columnSearch[dataIndex] || '']}
						autoEscape
						textToHighlight={text}
					/>
				);
			}

			if (dataIndex === 'color') {
				return (
					<div
						style={{
							width: '20px',
							height: '20px',
							backgroundColor: text,
							margin: 'auto',
							borderRadius: '20px',
						}}
					/>
				);
			}
			return text;
		},
	});

	const showDeleteConfirm = (id: UUID) => {
		confirmModal({
			title: 'Are you sure to delete this tag?',
			icon: <ExclamationCircleOutlined />,
			content: `Deleted tags can't be recovered!`,
			okText: 'Yes',
			okType: 'danger',
			cancelText: 'No',
			async onOk() {
				await dispatch(removeTag(id));
				await dispatch(removeTagRemote(id));
			},
		});
	};

	const columns: ColumnsType<IDictionaryTag> = [
		{
			title: 'Name',
			key: 'name',
			dataIndex: 'name',
			sorter: (a, b) => a.name.localeCompare(b.name),
			...getColumnSearchProps('name'),
		},
		{
			title: 'Color',
			key: 'color',
			dataIndex: 'color',
			width: 100,
			align: 'center',
			...getColumnSearchProps('color'),
		},
		{
			title: 'Actions',
			width: 70,
			render: (text, record) => {
				return (
					<Dropdown
						trigger={['click']}
						overlay={
							<Menu>
								<Menu.Item key="1" icon={<EditOutlined />}>
									Edit
								</Menu.Item>
								<Menu.Item
									key="2"
									icon={<DeleteOutlined />}
									danger
									onClick={() => showDeleteConfirm(record.id)}
								>
									Delete
								</Menu.Item>
							</Menu>
						}
					>
						<Button type="text">
							<MoreOutlined rotate={90} />
						</Button>
					</Dropdown>
				);
			},
		},
	];

	return (
		<Table<IDictionaryTag>
			columns={columns}
			rowKey="id"
			dataSource={tags}
			expandable={{
				expandedRowRender: ({ grammarPoint }) =>
					grammarPoint && <GrammarPoint point={grammarPoint} />,
				rowExpandable: (record) => !!record.grammarPoint,
				indentSize: 100,
			}}
			pagination={{
				position: ['bottomCenter'],
				onChange: (_, size) => {
					if (size) {
						setPageSize(size);
					}
				},
				pageSize,
				total,
				defaultCurrent: 1,
				defaultPageSize: 2,
			}}
			size="middle"
		/>
	);
};

export default TagList;
