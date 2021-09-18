import './DictionaryEntry.css';
import React, { useState, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IRootDispatch, IRootState } from 'store';
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
import { IDictionaryEntryResolved } from 'Document/Dictionary';
import DictEntry from '@components/DictionaryEntry/DictionaryEntry';
import { useHistory, useParams } from 'react-router-dom';
import { UUID } from 'Document/UUID';
import { getEntry } from 'api/dictionary.service';
import { notUndefined } from 'Document/Utility';
import { IExcerptedDocumentLink } from 'Document/Document';
import DocumentLink from '@components/DictionaryEntry/DocumentLink';
import {
	removeEntry,
	removeEntryRemote,
	saveEntryRemote,
	saveOrUpdateEntryInput,
} from '@store/dictionary/actions';
import { IEntryFormFields } from '@components/DictionaryEntry/EntryForm/EntryForm';
import DictEntryWithEdit from '@components/DictionaryEntry/DictEntryWithEdit/DictEntryWithEdit';
import Title from 'antd/lib/typography/Title';
import handleError from '@helpers/Error';
import { selectActiveLanguageConfig } from '@store/user/selectors';

interface IDictionaryEntryViewParams {
	entryId: UUID;
}

/**
 * Renders the Dictionary into a Table.
 *
 * Let's the user filter tags, and search other columns
 */
const DictionaryEntry: React.FC = () => {
	const [loading, setLoading] = useState(false);
	const [dictEntry, setDictEntry] = useState<IDictionaryEntryResolved | null>(
		null
	);
	const [rootDictEntry, setRootDictEntry] =
		useState<IDictionaryEntryResolved | null>(null);
	const [subDictEntries, setSubDictEntries] = useState<
		Array<IDictionaryEntryResolved>
	>([]);
	const [excerptLink, setExcerptLink] =
		useState<IExcerptedDocumentLink | null>(null);
	const [additionalExcerpts, setAdditionalExcerpt] = useState<
		Array<IExcerptedDocumentLink>
	>([]);

	const history = useHistory();
	const dispatch: IRootDispatch = useDispatch();
	const { entryId } = useParams<IDictionaryEntryViewParams>();
	const cachedTags = useSelector(
		(state: IRootState) => state.dictionary.tags
	);
	const activeLanguage = useSelector(selectActiveLanguageConfig);

	const fetchEntry = useCallback(
		async (id: UUID) => {
			setLoading(true);
			try {
				if (!activeLanguage) {
					throw new Error('No language selected!');
				}
				const entryResult = await getEntry({
					language: activeLanguage.key,
					id,
				});
				if (!entryResult) {
					throw new Error('Entry not found!');
				}
				const {
					entry,
					rootEntry,
					subEntries,
					linkExcerpt,
					otherExcerpts,
				} = entryResult;
				const tags = entry.tags
					.map((tagId) => cachedTags[tagId])
					.filter(notUndefined);

				const entryWithTags = {
					...entry,
					root: rootEntry
						? {
								...rootEntry,
								root: undefined,
								tags: rootEntry.tags
									.map((tag) => cachedTags[tag])
									.filter(notUndefined),
						  }
						: undefined,
					tags,
				};
				setDictEntry(entryWithTags);
				if (entry.firstSeen) {
					setExcerptLink({
						excerpt: linkExcerpt,
						link: entry.firstSeen,
					});
				} else {
					setExcerptLink(null);
				}

				if (otherExcerpts) {
					setAdditionalExcerpt(otherExcerpts);
				}

				if (rootEntry) {
					const rootTags = rootEntry.tags
						.map((tagId) => cachedTags[tagId])
						.filter(notUndefined);
					const rootEntryWithTags = {
						...rootEntry,
						root: undefined,
						tags: rootTags,
					};
					setRootDictEntry(rootEntryWithTags);
				} else {
					setRootDictEntry(null);
				}

				if (subEntries && subEntries.length > 0) {
					const newSubDictEntries = [];
					for (const subEntry of subEntries) {
						const subTags = subEntry.tags
							.map((tagId) => cachedTags[tagId])
							.filter(notUndefined);
						newSubDictEntries.push({
							...subEntry,
							root: undefined,
							tags: subTags,
						});
					}
					setSubDictEntries(newSubDictEntries);
				} else {
					setSubDictEntries([]);
				}
			} catch (e) {
				handleError(e);
			}
			setLoading(false);
		},
		[cachedTags, activeLanguage]
	);

	useEffect(() => {
		fetchEntry(entryId);
	}, [entryId, fetchEntry]);

	const saveDictEntry = useCallback(
		async (editResult: IEntryFormFields | null) => {
			if (editResult) {
				try {
					dispatch(saveOrUpdateEntryInput(editResult));
					await dispatch(saveEntryRemote(editResult, true));
					fetchEntry(entryId);
				} catch (e) {
					handleError(e);
				}
			}
		},
		[dispatch, entryId, fetchEntry]
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
						{!loading && dictEntry && (
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
									dictEntry={dictEntry}
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
						{rootDictEntry && (
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
								dataSource={[rootDictEntry]}
								renderItem={(entry) => (
									<List.Item>
										<DictEntry dictEntry={entry} canLink />
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
								renderItem={(entry) => (
									<List.Item>
										<DictEntry dictEntry={entry} canLink />
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
												word={dictEntry?.key || ''}
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
												word={dictEntry?.key || ''}
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

export default DictionaryEntry;
