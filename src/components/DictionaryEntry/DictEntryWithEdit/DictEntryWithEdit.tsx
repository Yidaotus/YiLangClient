/* eslint-disable react/destructuring-assignment */
import './DictEntryWithEdit.css';
import React, { useCallback, useRef, useState } from 'react';
import { Button, Dropdown, Menu, Modal } from 'antd';
import {
	CloseOutlined,
	DeleteOutlined,
	EditOutlined,
	ExclamationCircleOutlined,
	MoreOutlined,
	SaveFilled,
} from '@ant-design/icons';
import { IDictionaryEntryResolved } from 'Document/Dictionary';
import { useDeleteDictionaryEntry } from '@hooks/DictionaryQueryHooks';
import DictionaryEntry from '../DictionaryEntry';
import DictEntryEdit, { IWordInputRef } from '../DictEntryEdit/DictEntryEdit';

const { confirm } = Modal;

type IDictEntryWithEditProps = {
	dictEntry: IDictionaryEntryResolved;
	canLink?: boolean;
	canRemove?: boolean;
};

const DictEntryWithEdit: React.FC<IDictEntryWithEditProps> = (props) => {
	const { dictEntry, canLink, canRemove } = props;
	const [editing, setEditing] = useState(false);
	const deleteEntry = useDeleteDictionaryEntry();
	const dictEntryEdit = useRef<IWordInputRef>(null);

	const finish = async () => {
		if (dictEntryEdit.current) {
			const editResult = await dictEntryEdit.current.finish();
			if (editResult.isDone) {
				setEditing(false);
			}
		}
	};

	const cancel = () => {
		if (dictEntryEdit.current) {
			const isDone = dictEntryEdit.current.cancel();
			if (isDone) {
				setEditing(false);
			}
		}
	};

	const remove = useCallback(async () => {
		await deleteEntry.mutateAsync(dictEntry.id);
	}, [deleteEntry, dictEntry.id]);

	const showDeleteConfirm = () => {
		confirm({
			title: 'Are you sure to delete this entry?',
			icon: <ExclamationCircleOutlined />,
			content: `Deleted entries can't be recovered!`,
			okText: 'Yes',
			okType: 'danger',
			cancelText: 'No',
			onOk() {
				remove();
			},
		});
	};

	const moreDropdown = (
		<Menu>
			<Menu.Item
				key="1"
				icon={<EditOutlined />}
				onClick={() => setEditing((editState) => !editState)}
			>
				Edit
			</Menu.Item>
			<Menu.Item
				key="2"
				icon={<DeleteOutlined />}
				onClick={showDeleteConfirm}
				danger
			>
				Delete
			</Menu.Item>
		</Menu>
	);

	return (
		<div className="entry-with-edit-container">
			<div className="entry-with-edit-controlls-top">
				{canRemove ? (
					<Dropdown overlay={moreDropdown}>
						<Button type="text">
							<MoreOutlined rotate={90} />
						</Button>
					</Dropdown>
				) : (
					<Button
						type="text"
						size="small"
						icon={<EditOutlined />}
						onClick={() => setEditing((editState) => !editState)}
					/>
				)}
			</div>
			{editing && (
				<div>
					<DictEntryEdit
						entryKey={{
							...dictEntry,
							tags: dictEntry.tags.map((tag) => tag.id),
							root: dictEntry.root,
						}}
						ref={dictEntryEdit}
					/>
					<div className="entry-with-edit-controlls-bottom">
						<Button onClick={cancel} icon={<CloseOutlined />}>
							Cancel
						</Button>
						<Button
							type="primary"
							onClick={finish}
							icon={<SaveFilled />}
						>
							Save
						</Button>
					</div>
				</div>
			)}
			{!editing && (
				<DictionaryEntry entryId={dictEntry.id} canLink={canLink} />
			)}
		</div>
	);
};

export default DictEntryWithEdit;
