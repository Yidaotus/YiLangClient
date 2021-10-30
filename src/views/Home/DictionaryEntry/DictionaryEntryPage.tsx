import './DictionaryEntryPage.css';
import React, { useState, useCallback } from 'react';
import {
	Card,
	Col,
	Divider,
	List,
	PageHeader,
	Row,
	Skeleton,
	Spin,
} from 'antd';
import { useHistory, useParams } from 'react-router-dom';
import { IExcerptedDocumentLink } from 'Document/Document';
import DocumentLink from '@components/DictionaryEntry/DocumentLink';
import { IEntryFormFields } from '@components/DictionaryEntry/EntryForm/EntryForm';
import DictEntryWithEdit from '@components/DictionaryEntry/DictEntryWithEdit/DictEntryWithEdit';
import Title from 'antd/lib/typography/Title';
import DictionaryEntry from '@components/DictionaryEntry/DictionaryEntry';
import { IDictionaryEntryResolved } from 'Document/Dictionary';
import { useDictionaryEntryResolved } from '@hooks/DictionaryQueryHooks';

interface IDictionaryEntryViewParams {
	entryId: string;
}

/**
 * Renders the Dictionary into a Table.
 *
 * Let's the user filter tags, and search other columns
 */
const DictionaryEntryPage: React.FC = () => {
	const [loading, setLoading] = useState(false);
	const [excerptLink, setExcerptLink] =
		useState<IExcerptedDocumentLink | null>(null);
	const [additionalExcerpts, setAdditionalExcerpt] = useState<
		Array<IExcerptedDocumentLink>
	>([]);

	const history = useHistory();
	const { entryId } = useParams<IDictionaryEntryViewParams>();
	const [loadingMain, entry] = useDictionaryEntryResolved(entryId);
	const [loadingRoot, rootEntry] = useDictionaryEntryResolved(
		entry?.root || null
	);
	const [subDictEntries, setSubDictEntries] = useState<
		Array<IDictionaryEntryResolved>
	>([]);

	return (
		<PageHeader
			className="site-page-header"
			onBack={() => {
				history.goBack();
			}}
			title="Dictionary"
			subTitle="Everything dictionary"
			ghost={false}
		>
			<Spin spinning={loading}>
				<Row gutter={16}>
					<Col span={24}>
						{loading && <Skeleton loading />}
						{!loading && entry && (
							<Card
								size="small"
								title={
									<Title
										level={3}
										style={{ marginBottom: '0px' }}
									>
										Entry
									</Title>
								}
								bordered
							>
								<DictEntryWithEdit
									dictEntry={entry}
									canRemove
								/>
							</Card>
						)}
					</Col>
				</Row>
				<Divider />
				<Row gutter={12}>
					<Col span={12}>
						{rootEntry && (
							<List
								style={{ backgroundColor: 'white' }}
								header={
									<Title
										level={3}
										style={{ marginBottom: '0px' }}
									>
										Root
									</Title>
								}
								bordered
								size="small"
								dataSource={[rootEntry]}
								renderItem={(entryItem) => (
									<List.Item>
										<DictionaryEntry
											entryId={entryItem.id}
											canLink
										/>
									</List.Item>
								)}
							/>
						)}
					</Col>
					<Col span={12}>
						{subDictEntries.length > 0 && (
							<List
								style={{ backgroundColor: 'white' }}
								header={
									<Title
										level={3}
										style={{ marginBottom: '0px' }}
									>
										Subentries
									</Title>
								}
								bordered
								size="small"
								dataSource={subDictEntries}
								renderItem={(entryItem) => (
									<List.Item>
										<DictionaryEntry
											entryId={entryItem.id}
											canLink
										/>
									</List.Item>
								)}
							/>
						)}
					</Col>
				</Row>
				{excerptLink && (
					<Row>
						<Col span={24}>
							<Divider />
							<List
								style={{ backgroundColor: 'white' }}
								header={
									<Title
										level={3}
										style={{ marginBottom: '0px' }}
									>
										First seen
									</Title>
								}
								bordered
								size="small"
								dataSource={[excerptLink]}
								renderItem={(excerpt) => (
									<List.Item>
										<span className="ellipsed">
											<DocumentLink
												link={excerpt.link}
												excerpt={excerpt.excerpt}
												word={entry?.key || ''}
											/>
										</span>
									</List.Item>
								)}
							/>
						</Col>
					</Row>
				)}
				{additionalExcerpts.length > 0 && (
					<Row>
						<Col span={24}>
							<Divider />
							<List
								style={{ backgroundColor: 'white' }}
								header={
									<Title
										level={3}
										style={{ marginBottom: '0px' }}
									>
										Also seen in
									</Title>
								}
								bordered
								size="small"
								dataSource={additionalExcerpts}
								renderItem={(excerpt) => (
									<List.Item>
										<span className="ellipsed">
											<DocumentLink
												link={excerpt.link}
												excerpt={excerpt.excerpt}
												word={entry?.key || ''}
											/>
										</span>
									</List.Item>
								)}
							/>
						</Col>
					</Row>
				)}
			</Spin>
		</PageHeader>
	);
};

export default DictionaryEntryPage;
