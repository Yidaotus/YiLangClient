import './Editor.css';
import React, { useCallback, useRef, useState } from 'react';

import { Tabs, Divider, Button, Spin, notification, Modal, Empty } from 'antd';
import {
	MinusOutlined,
	PlusOutlined,
	DeleteOutlined,
	SaveOutlined,
	ExclamationCircleOutlined,
} from '@ant-design/icons';

import { useDispatch, useSelector } from 'react-redux';
import { DocumentBlock } from 'Document/Block';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import { selectActiveLanguageConfig } from '@store/user/selectors';
import {
	fetchTags,
	resetDictionary,
	saveDictionary,
	saveTags,
} from 'store/dictionary/actions';
import { IRootDispatch, IRootState } from 'store';
import handleError from '@helpers/Error';
import AddBlockPanel from './Panels/AddBlockPanel';
import WordsPanel from './Panels/WordsPanel';

import EditorDocument from './EditorDocument';

import {
	addBlock,
	loadDocument,
	resetEditor,
	saveDocument,
} from '../../store/editor/actions';
import SentencesPanel from './Panels/SentencesPanel';

const { TabPane } = Tabs;
const { confirm } = Modal;

const YiEditor: React.FC = () => {
	const dispatch: IRootDispatch = useDispatch();

	const [loading, setLoading] = useState<string | null>(null);
	const [showAddBlockPanel, setShowAddBlockPanel] = useState(false);
	const editorDocument = useSelector(
		(state: IRootState) => state.editor.document
	);
	const currentLanguage = useSelector(selectActiveLanguageConfig);
	const editorHasBlocks =
		editorDocument && Object.values(editorDocument.blocks).length > 0;
	const documentModified = useSelector(
		(state: IRootState) => state.editor.documentModified
	);

	const save = useCallback(async () => {
		setLoading('Saving Dictionary');
		try {
			setLoading('Saving Dictionary');
			await dispatch(saveDictionary());
			setLoading('Saving Tags');
			await dispatch(saveTags());
			setLoading('Saving Document');
			await dispatch(saveDocument());
			notification.open({
				message: 'Done',
				description: 'Document saved',
				type: 'success',
			});
		} catch (e) {
			handleError(e);
		}
		setLoading(null);
	}, [dispatch]);

	const createEditorDocument = useCallback(async () => {
		try {
			await dispatch(loadDocument({ type: 'new' }));
			notification.open({
				message: 'Done',
				description: 'New Document created',
				type: 'success',
			});
		} catch (e) {
			handleError(e);
		}
	}, [dispatch]);

	const resetEditorDocument = useCallback(async () => {
		try {
			dispatch(resetEditor());
			dispatch(resetDictionary());
			if (currentLanguage) {
				await dispatch(fetchTags(currentLanguage.key));
			}
			notification.open({
				message: 'Done',
				description: 'Editor Reset',
				type: 'success',
			});
		} catch (e) {
			handleError(e);
		}
	}, [currentLanguage, dispatch]);

	const confirmReset = useCallback(async () => {
		if (documentModified) {
			confirm({
				title: 'Resetting Document',
				icon: <ExclamationCircleOutlined />,
				content: `This will reset the currently loaded Document. Continue?`,
				okText: 'Yes',
				okType: 'primary',
				cancelText: 'No',
				async onOk() {
					resetEditorDocument();
				},
			});
		} else {
			resetEditorDocument();
		}
	}, [documentModified, resetEditorDocument]);

	// If we change our Document we need to check if we have stored caret
	// and restore if this is the case.
	return (
		<div>
			<div style={{ position: 'relative' }}>
				<Spin
					spinning={!!loading}
					size="large"
					tip={loading || undefined}
				>
					<div>
						<div className="editor-container">
							<Tabs
								defaultActiveKey="1"
								centered
								tabBarStyle={{
									position: 'sticky',
								}}
							>
								<TabPane tab="Document" key="1">
									{editorDocument ? (
										<DndProvider backend={HTML5Backend}>
											<EditorDocument
												document={editorDocument}
											/>
										</DndProvider>
									) : (
										<Empty
											image={Empty.PRESENTED_IMAGE_SIMPLE}
											description={
												<span>No Document loaded.</span>
											}
										>
											<Button
												type="primary"
												onClick={createEditorDocument}
											>
												Create Now
											</Button>
										</Empty>
									)}
								</TabPane>
								<TabPane tab="Elements" key="2">
									<SentencesPanel />
									<Divider />
									<WordsPanel />
								</TabPane>
							</Tabs>

							<ul className="editor-menu">
								<li>
									<Button
										type="text"
										icon={<DeleteOutlined />}
										onClick={confirmReset}
										disabled={!editorHasBlocks}
									/>
								</li>
								<li>
									<Button
										type="text"
										icon={
											showAddBlockPanel ? (
												<MinusOutlined />
											) : (
												<PlusOutlined />
											)
										}
										onClick={() =>
											setShowAddBlockPanel(
												(current) => !current
											)
										}
										disabled={!editorDocument}
									/>
								</li>
								<li>
									<Button
										type="text"
										icon={<SaveOutlined />}
										disabled={
											!editorHasBlocks ||
											!documentModified
										}
										onClick={() => save()}
									/>
								</li>
							</ul>
							{showAddBlockPanel && (
								<AddBlockPanel
									addBlockCB={(block: DocumentBlock) => {
										dispatch(addBlock(block));
										setShowAddBlockPanel(false);
									}}
								/>
							)}
						</div>
					</div>
				</Spin>
			</div>
		</div>
	);
};

export default YiEditor;
