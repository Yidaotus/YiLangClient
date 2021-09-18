import './SentencesPanel.css';
import React, { useState, useEffect, useCallback } from 'react';
import { Button, Typography, Empty, List, Popconfirm } from 'antd';
import {
	DeleteOutlined,
	EditOutlined,
	QuestionCircleOutlined,
	SaveOutlined,
} from '@ant-design/icons';
import { DocumentBlock } from 'Document/Block';
import {
	isFragmentType,
	ResolvedFragment,
	ISentenceFragmentData,
} from 'Document/Fragment';
import { IDictionaryEntry } from 'Document/Dictionary';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState, StoreMap } from 'store';
import { removeFragment, updateFragment } from 'store/editor/actions';
import { selectActiveFragmentLayer } from '@store/editor/selectors';
import { notUndefined } from 'Document/Utility';
import FragmentedString from '../Fragments/FragmentedString';
import { RenderCallback } from '../Fragments/FragmentRenderer';

const { Paragraph } = Typography;

export interface IBlockPanelProps {
	blocks: StoreMap<DocumentBlock>;
}

const WordRenderer: RenderCallback<StoreMap<IDictionaryEntry>> = ({
	subroot,
	fragment,
	renderData,
}) => {
	if (isFragmentType('Word')(fragment)) {
		const dictEntry = renderData[fragment.data.dictId];
		let spelling;
		if (dictEntry) {
			if (subroot === dictEntry.key) {
				spelling = dictEntry?.spelling;
			}
		}
		return (
			<span
				data-word={subroot}
				data-spelling={spelling}
				key={fragment.id}
				className={spelling && 'sentence-spelling'}
			>
				<span className="sentence-word-fragment">{subroot}</span>
			</span>
		);
	}
	return <></>;
};

type SentenceFragmentWithMeta = ResolvedFragment<ISentenceFragmentData>;

type SentenceTranslationCB = ({
	sentenceFragment,
	translation,
}: {
	sentenceFragment: SentenceFragmentWithMeta;
	translation: string | null;
}) => void;

const SentenceElement: React.FC<{
	sentence: SentenceFragmentWithMeta;
	setSentence: SentenceTranslationCB;
}> = ({ sentence, setSentence }) => {
	const [editing, setEditing] = useState(false);
	const [translation, setTranslation] = useState('');

	const updateTranslation = useCallback(
		(newTranslation: string | null) => {
			setSentence({
				sentenceFragment: sentence,
				translation: newTranslation,
			});
		},
		[setSentence, sentence]
	);
	const userDictionary = useSelector(
		(state: IRootState) => state.dictionary.dictionary
	);

	useEffect(() => {
		setTranslation(sentence.data.translation);
	}, [sentence.data.translation]);

	return (
		<div key={sentence.id} className="sentence-block">
			<div style={{ float: 'right' }}>
				{!editing ? (
					<Button
						size="small"
						type="text"
						icon={<EditOutlined />}
						onClick={() => setEditing(true)}
					/>
				) : (
					<Button
						size="small"
						type="text"
						icon={<SaveOutlined />}
						onClick={() => {
							setEditing(false);
						}}
					/>
				)}
				<Popconfirm
					title="Are you sure？"
					placement="top"
					icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
					okText="Yes"
					cancelText="No"
					onConfirm={() => updateTranslation(null)}
				>
					<Button
						size="small"
						type="text"
						icon={<DeleteOutlined />}
					/>
				</Popconfirm>
			</div>
			<div className="show-spelling sentence-block-title">
				<FragmentedString
					fragmentable={{
						id: sentence.id,
						showSpelling: true,
						root: sentence.value,
						fragments: sentence.data.words,
					}}
					customRenderer={WordRenderer}
					renderData={userDictionary}
				/>
			</div>
			<div className="sentence-block-translation">
				<Paragraph
					editable={{
						icon: <></>,
						tooltip: false,
						editing,
						onChange: (e) => {
							setTranslation(e);
							updateTranslation(e);
							setEditing(false);
						},
					}}
				>
					{translation}
				</Paragraph>
			</div>
		</div>
	);
};

const SentencesPanel: React.FC = () => {
	const dispatch = useDispatch();
	const fragmentables = useSelector(
		(state: IRootState) => state.editor.fragmentables
	);
	const fragments =
		useSelector((state: IRootState) => selectActiveFragmentLayer(state)) ||
		{};

	let sentences: Array<SentenceFragmentWithMeta> = [];
	for (const fragmentable of Object.values(fragmentables)) {
		const sentenceFragments = fragmentable.fragments
			.map((fragId) => fragments[fragId])
			.filter(notUndefined)
			.filter(isFragmentType('Sentence'))
			.map((fragment) => ({
				...fragment,
				value: fragmentable.root.substring(
					fragment.range.start,
					fragment.range.end
				),
				fragmentableId: fragmentable.id,
			}));
		sentences = sentences.concat(sentenceFragments);
	}

	const setSentenceTranslation: SentenceTranslationCB = ({
		sentenceFragment,
		translation,
	}) => {
		if (translation) {
			const fragment = {
				...sentenceFragment,
				data: { ...sentenceFragment.data, translation },
			};
			dispatch(updateFragment(fragment));
		} else {
			dispatch(removeFragment(sentenceFragment.id));
		}
	};

	return (
		<div className="sentences-container">
			{sentences.length > 0 ? (
				<List
					grid={{
						gutter: 24,
						column: 2,
					}}
					dataSource={sentences}
					renderItem={(sentence) => (
						<List.Item>
							<SentenceElement
								sentence={sentence}
								setSentence={setSentenceTranslation}
							/>
						</List.Item>
					)}
				/>
			) : (
				<Empty
					image={Empty.PRESENTED_IMAGE_SIMPLE}
					description={
						<span>Added Sentences will be listed here</span>
					}
				/>
			)}
		</div>
	);
};

export default SentencesPanel;
