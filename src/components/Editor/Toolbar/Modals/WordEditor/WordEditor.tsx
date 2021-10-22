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

export type WordInputResult = Omit<IDictionaryEntry, 'firstSeen' | 'id'>;

export interface IWordInputState {
	callback: (entry: string | null) => void;
	root: string;
}

export interface IWordInputProps extends IWordInputState {
	width?: string;
}

interface IWordInputReturn {
	wordInputState: IWordInputState;
	getUserWord: (key: string) => Promise<string | null>;
}

const defaultInputstate: IWordInputState = {
	root: '',
	callback: () => {},
};

const useWordInput = (): IWordInputReturn => {
	const [inputState, setInputState] =
		useState<IWordInputState>(defaultInputstate);

	const getUserWord = (root: string): Promise<string | null> => {
		return new Promise((resolve) => {
			setInputState({
				callback: (entryID: string | null) => {
					resolve(entryID);
					setInputState(defaultInputstate);
				},
				root,
			});
		});
	};

	return { wordInputState: inputState, getUserWord };
};

const WordInput: React.FC<IWordInputProps> = ({
	callback,
	root,
	width = '400px',
}) => {
	const dictEntryEdit = useRef<IWordInputRef>(null);
	const [editMode, setEditMode] = useState<WordEditorMode>('word');
	const lookupSources: Array<IDictionaryLookupSource> = [];

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

	const finish = async () => {
		if (dictEntryEdit.current) {
			const editResult = await dictEntryEdit.current.finish();
			if (editResult.isDone) {
				callback(editResult.entryId);
			}
		}
	};

	const cancel = () => {
		if (dictEntryEdit.current) {
			const isDone = dictEntryEdit.current.cancel();
			if (isDone) {
				callback(null);
			}
		}
	};

	return (
		<div className="word-input-container" style={{ width }}>
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

export default React.memo(WordInput);
export { useWordInput };
