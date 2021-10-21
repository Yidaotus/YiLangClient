import './DictionaryEntryPage.css';
import React, { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { IRootDispatch } from 'store';
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
import { UUID } from 'Document/UUID';
import { IExcerptedDocumentLink } from 'Document/Document';
import DocumentLink from '@components/DictionaryEntry/DocumentLink';
import {
	removeEntry,
	removeEntryRemote,
	saveEntry,
	saveOrUpdateEntryInput,
} from '@store/dictionary/actions';
import { IEntryFormFields } from '@components/DictionaryEntry/EntryForm/EntryForm';
import DictEntryWithEdit from '@components/DictionaryEntry/DictEntryWithEdit/DictEntryWithEdit';
import Title from 'antd/lib/typography/Title';
import handleError from '@helpers/Error';
import DictionaryEntry from '@components/DictionaryEntry/DictionaryEntry';
import { IDictionaryEntryResolved } from 'Document/Dictionary';
import useDictionaryEntryResolved from '@hooks/useDictionaryEntriesResolved';

interface IDictionaryEntryViewParams {
	entryId: UUID;
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
	const dispatch: IRootDispatch = useDispatch();
	const { entryId } = useParams<IDictionaryEntryViewParams>();
	const [loadingMain, entry] = useDictionaryEntryResolved(entryId);
	const [loadingRoot, rootEntry] = useDictionaryEntryResolved(
		entry?.root || null
	);
	const [subDictEntries, setSubDictEntries] = useState<
		Array<IDictionaryEntryResolved>
	>([]);

	const saveDictEntry = useCallback(
		async (editResult: IEntryFormFields | null) => {
			if (editResult) {
				try {
					dispatch(saveOrUpdateEntryInput(editResult));
					await dispatch(saveEntry(editResult, true));
				} catch (e) {
					handleError(e);
				}
			}
		},
		[dispatch]
	);

	const removeDictEntry = useCallback(
		async (id: UUID) => {
			setLoading(true);
			try {
				dispatch(removeEntry(id));
				await dispatch(removeEntryRemote(id));
				history.goBack();
			} catch (e) {
				handleError(e);
			}
			setLoading(false);
		},
		[dispatch, history]
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
									saveEntry={saveDictEntry}
									removeEntry={removeDictEntry}
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
