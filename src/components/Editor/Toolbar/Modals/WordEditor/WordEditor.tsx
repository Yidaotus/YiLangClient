import './WordEditor.css';
import React, { useMemo, useRef, useState } from 'react';
import { Button, Dropdown, Menu, Card } from 'antd';
import { IDictionaryEntry } from 'Document/Dictionary';
import {
	SearchOutlined,
	SaveOutlined,
	ReadOutlined,
	StopOutlined,
	RollbackOutlined,
} from '@ant-design/icons';
import DictEntryEdit, {
	IWordInputRef,
	WordEditorMode,
} from '@components/DictionaryEntry/DictEntryEdit/DictEntryEdit';
import LookupSourceLink from '@components/LookupSourceLink';
import { IDictionaryLookupSource } from 'Document/Config';
import { WordElement } from '@components/Editor/CustomEditor';
import { Editor, Transforms, Text, BaseRange, BaseSelection } from 'slate';
import { useSlateStatic } from 'slate-react';

export type WordInputResult = Omit<IDictionaryEntry, 'firstSeen' | 'id'>;

export interface IWordInputProps {
	close: () => void;
	selection: BaseSelection;
}

const WordInput: React.FC<IWordInputProps> = ({ close, selection }) => {
	const editor = useSlateStatic();
	const dictEntryEdit = useRef<IWordInputRef>(null);
	const [editMode, setEditMode] = useState<WordEditorMode>('word');
	const lookupSources: Array<IDictionaryLookupSource> = [];
	const root = selection
		? Editor.string(editor, selection, {
				voids: true,
		  })
		: '';

	const cardTitle = useMemo(() => {
		switch (editMode) {
			case 'word':
				return 'Word Editor';
			case 'tag':
				return 'Tag Editor';
			case 'root':
				return 'Root Editor';
			default:
				return 'Word Editor';
		}
	}, [editMode]);

	const menu = (
		<Menu>
			{lookupSources.map((source) => {
				return (
					<Menu.Item key={source.name}>
						<LookupSourceLink source={source} searchTerm={root} />
					</Menu.Item>
				);
			})}
		</Menu>
	);

	const wrapWithWord = async (entryId: string) => {
		if (entryId) {
			const vocab: WordElement = {
				type: 'word',
				dictId: entryId,
				children: [{ text: '' }],
			};
			Transforms.wrapNodes(editor, vocab, {
				split: true,
			});
			const allLeafs = Editor.nodes(editor, {
				at: [[0], [editor.children.length - 1]],
				match: (e) => Text.isText(e),
			});
			const searchRegexp = new RegExp(root, 'g');
			for (const [leafMatch, leafPath] of allLeafs) {
				if (Text.isText(leafMatch)) {
					const foundRoots = String(leafMatch.text).matchAll(
						searchRegexp
					);
					const foundRoot = foundRoots.next();
					if (foundRoot.value?.index !== undefined) {
						// we split the node if we found any hits, so we can just wrap the first hit
						// and continue the loop. Since the loop makes use of the generator function
						// it will automatically iterate to the next (new)
						Transforms.wrapNodes(editor, vocab, {
							at: {
								anchor: {
									path: leafPath,
									offset: foundRoot.value.index,
								},
								focus: {
									path: leafPath,
									offset:
										foundRoot.value.index +
										foundRoot.value[0].length,
								},
							},
							split: true,
						});
					}
				}
			}
		}
	};

	const finish = async () => {
		if (dictEntryEdit.current) {
			const editResult = await dictEntryEdit.current.finish();
			if (editResult.isDone && editResult.entryId) {
				wrapWithWord(editResult.entryId);
			}
		}
	};

	const cancel = () => {
		if (dictEntryEdit.current) {
			const isDone = dictEntryEdit.current.cancel();
			if (isDone) {
				close();
			}
		}
	};

	return (
		<div className="word-input-container" style={{ width: '300px' }}>
			<Card
				color="green"
				title={
					<div className="word-input-head">
						<ReadOutlined />
						{cardTitle}
						<Dropdown overlay={menu} placement="bottomCenter">
							<Button
								shape="circle"
								size="small"
								type="primary"
								icon={<SearchOutlined />}
							/>
						</Dropdown>
					</div>
				}
				actions={[
					editMode === 'word' ? (
						<StopOutlined key="discard" onClick={cancel} />
					) : (
						<RollbackOutlined key="discard" onClick={cancel} />
					),
					<SaveOutlined key="save" onClick={() => finish()} />,
				]}
				bodyStyle={{ padding: '12px' }}
			>
				<div className="word-input-root-form">
					<DictEntryEdit
						ref={dictEntryEdit}
						root={root}
						stateChanged={setEditMode}
					/>
				</div>
			</Card>
		</div>
	);
};

export default WordInput;
