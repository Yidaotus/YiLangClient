import './DocumentExcerpt.css';

import React from 'react';
import { IDocumentExcerpt } from 'api/definitions/api';
import { Button, Card, Dropdown, Menu, Modal } from 'antd';
import {
	DeleteOutlined,
	EditOutlined,
	ExclamationCircleOutlined,
	MoreOutlined,
} from '@ant-design/icons';
import Meta from 'antd/lib/card/Meta';
import Link from 'antd/lib/typography/Link';

const { confirm } = Modal;

interface IDocumentExcerptProps {
	excerpt: IDocumentExcerpt;
	selectDocument: (id: string) => void;
	removeDocument?: (id: string) => void;
}

/**
 * Renders the Dictionary into a Table.
 *
 * Let's the user filter tags, and search other columns
 */
const DocumentExcerpt: React.FC<IDocumentExcerptProps> = ({
	excerpt,
	selectDocument,
	removeDocument,
}) => {
	const showDeleteConfirm = () => {
		confirm({
			title: 'Are you sure to delete this document?',
			icon: <ExclamationCircleOutlined />,
			content: `Deleted documents can't be recovered!`,
			okText: 'Yes',
			okType: 'danger',
			cancelText: 'No',
			onOk() {
				removeDocument?.(excerpt.id);
			},
		});
	};

	const moreDropdown = (
		<Menu>
			<Menu.Item key="1" icon={<EditOutlined />} onClick={() => {}}>
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
		<Card
			title={
				<Meta
					title={
						<Link onClick={() => selectDocument(excerpt.id)}>
							{excerpt.title}
						</Link>
					}
					description={excerpt.updatedAt.toLocaleString()}
				/>
			}
			key={excerpt.id}
			extra={
				removeDocument && (
					<Dropdown overlay={moreDropdown}>
						<Button type="text">
							<MoreOutlined rotate={90} />
						</Button>
					</Dropdown>
				)
			}
		>
			<p>{excerpt.excerpt}</p>
		</Card>
	);
};

export default DocumentExcerpt;
