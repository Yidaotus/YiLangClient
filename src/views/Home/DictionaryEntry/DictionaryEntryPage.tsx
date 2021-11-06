import './DictionaryEntryPage.css';
import React, { useState } from 'react';
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
import DictEntryWithEdit from '@components/DictionaryEntry/DictEntryWithEdit/DictEntryWithEdit';
import Title from 'antd/lib/typography/Title';
import DictionaryEntry from '@components/DictionaryEntry/DictionaryEntry';
import { IDictionaryEntryResolved } from 'Document/Dictionary';
import {
	useDictionaryEntryResolved,
	useDictionarySentence,
	useDictionarySentencesByWord,
} from '@hooks/DictionaryQueryHooks';

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
	const [sentencesLoading, sentences] = useDictionarySentencesByWord(entryId);
	const [firstSeenLoading, firstSeen] = useDictionarySentence(
		entry?.firstSeen?.sentenceId || null
	);

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
				{firstSeen && (
					<Row>
						<Col span={24}>
							<Spin spinning={firstSeenLoading}>
								<p>{firstSeen.content}</p>
								<p>{firstSeen.translation}</p>
							</Spin>
						</Col>
					</Row>
				)}
				{sentences && (
					<Row>
						<Col span={24}>
							<Spin spinning={sentencesLoading}>
								<List
									style={{ backgroundColor: 'white' }}
									header={
										<Title
											level={3}
											style={{ marginBottom: '0px' }}
										>
											Sentences
										</Title>
									}
									bordered
									size="small"
									dataSource={sentences}
									renderItem={(sentence) => (
										<List.Item>
											<span className="ellipsed">
												<p>{sentence.content}</p>
												<p>{sentence.translation}</p>
											</span>
										</List.Item>
									)}
								/>
							</Spin>
						</Col>
					</Row>
				)}
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
