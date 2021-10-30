import './Editor.css';
import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';

import { Tabs, Spin, notification } from 'antd';

import handleError from '@helpers/Error';

import { withHistory } from 'slate-history';
import { ReactEditor, Slate, withReact } from 'slate-react';
import { createEditor, Descendant, Editor } from 'slate';
import useSelection from '@hooks/useSelection';
import { useActiveLanguageConf } from '@hooks/ConfigQueryHooks';
import usePerstistantState from '@hooks/usePersistantState';
import EditorDocument from './EditorDocument';
import WordsPanel from './WordsPanel/WordsPanel';
import DictPopupController from './Popups/DictPopupController';
import Toolbar from './Toolbar/Toolbar';
import { EditorElement, CustomEditor } from './CustomEditor';
import WordEditorModal from './Toolbar/Modals/WordEditor/WordEditorModal';

const { TabPane } = Tabs;

const withYiLang = (editor: Editor) => {
	const { isInline, isVoid } = editor;
	const inlineTypes: Array<EditorElement['type']> = [
		'word',
		'mark',
		'sentence',
		'highlight',
	];

	const voidTypes: Array<EditorElement['type']> = ['word', 'image'];

	// eslint-disable-next-line no-param-reassign
	editor.isInline = (element) => {
		return inlineTypes.includes(element.type) ? true : isInline(element);
	};

	// eslint-disable-next-line no-param-reassign
	editor.isVoid = (element) => {
		return voidTypes.includes(element.type) ? true : isVoid(element);
	};

	return editor;
};

const YiEditor: React.FC = () => {
	const editorContainer = useRef(null);
	const [loading, setLoading] = useState<string | null>(null);
	const [wordEditorVisible, setWordEditorVisible] = useState(false);
	const [selectedKey, setSelectedKey] = useState('');
	const currentLanguage = useActiveLanguageConf();

	const save = useCallback(async () => {
		setLoading('Saving Dictionary');
		try {
			setLoading('Saving Dictionary');
			// await dispatch(saveDictionary());
			setLoading('Saving Tags');
			// await dispatch(saveTags());
			setLoading('Saving Document');
			// await dispatch(saveDocument());
			notification.open({
				message: 'Done',
				description: 'Document saved',
				type: 'success',
			});
		} catch (e) {
			handleError(e);
		}
		setLoading(null);
	}, []);

	const createEditorDocument = useCallback(async () => {
		try {
			// await dispatch(loadDocument({ type: 'new' }));
			notification.open({
				message: 'Done',
				description: 'New Document created',
				type: 'success',
			});
		} catch (e) {
			handleError(e);
		}
	}, []);

	const resetEditorDocument = useCallback(async () => {
		try {
			// dispatch(resetEditor());
			// dispatch(resetDictionary());
			if (currentLanguage) {
				// await dispatch(fetchTags(currentLanguage.key));
			}
			notification.open({
				message: 'Done',
				description: 'Editor Reset',
				type: 'success',
			});
		} catch (e) {
			handleError(e);
		}
	}, [currentLanguage]);

	const editor = useMemo(
		() =>
			withReact(withHistory(withYiLang(createEditor()))) as CustomEditor,
		[]
	);
	const [selection, setSelection] = useSelection(editor);

	const [editorNodes, setEditorNodes] = usePerstistantState<Descendant[]>(
		'editor',
		[
			{
				type: 'title',
				align: null,
				children: [
					{
						text: 'イチゴの中はどうなっている？',
					},
				],
			},
			{
				type: 'subtitle',
				align: null,
				children: [
					{
						text: 'イチゴの中はどうなっている？',
					},
				],
			},
			{
				type: 'image',
				align: null,
				src: 'https://www.nhk.or.jp/das/image/D0005110/D0005110342_00000_C_001.jpg',
				caption: 'lul123',
				children: [{ text: '' }],
			},
			{
				type: 'blockQuote',
				align: null,
				children: [
					{
						text: 'Lorem ipsum dolar sit!',
					},
				],
			},
			{
				type: 'paragraph',
				align: null,
				children: [
					{
						text: '今回のミカタは「中を見てみる」。イチゴの中はどうなっているか、街の人に聞いてみました。まず、男の子。「こんな感じだ と思います。まわりが赤くなって、中に粒（つぶ）がある」。中にツブツブ？　続いて女の子。',
					},
					{
						text: '真ん中が白っぽくて空洞（くうどう）になっていて、まわりは赤い」。中に空洞？　若い女の人は、「真ん中が真っ白で、徐々（じょじょ）に赤くなっていく感じ」。真ん中は白い？　みんながかいたイチゴの中。中にツブツブ、中に空洞、真ん中が白い、スジがある…。実際はどうなっているのでしょう。',
					},
				],
			},
			{
				type: 'bulletedList',
				children: [
					{
						type: 'listItem',
						children: [
							{
								text: 'First',
							},
						],
					},
					{
						type: 'listItem',
						children: [
							{
								text: 'Second',
							},
						],
					},
					{
						type: 'listItem',
						children: [
							{
								text: 'Third',
							},
						],
					},
				],
			},
		]
	);

	useEffect(() => {
		if (selection) {
			const range = ReactEditor.toDOMRange(editor, selection);
			const domSelection = document.getSelection();
			if (domSelection?.isCollapsed && !range.collapsed) {
				document.getSelection()?.removeAllRanges();
				document.getSelection()?.addRange(range);
			}
		}
	}, [editor, selection]);

	const closeWordEditorModal = useCallback(() => {
		setWordEditorVisible(false);
	}, [setWordEditorVisible]);

	return (
		<div>
			<div>
				<Spin
					spinning={!!loading}
					size="large"
					tip={loading || undefined}
				>
					<div>
						<div className="editor-container">
							<Slate
								editor={editor}
								value={editorNodes}
								onChange={(newValue) => {
									if (newValue !== editorNodes) {
										setEditorNodes(newValue);
									}
									setSelection(editor.selection);
								}}
							>
								<Tabs
									defaultActiveKey="1"
									centered
									tabBarStyle={{
										position: 'sticky',
									}}
								>
									<TabPane tab="Document" key="1">
										<div
											ref={editorContainer}
											style={{ position: 'relative' }}
										>
											<Toolbar
												selection={selection}
												showWordEditor={() => {
													const key = selection
														? Editor.string(
																editor,
																selection,
																{
																	voids: true,
																}
														  )
														: '';
													setSelectedKey(key);
													setWordEditorVisible(true);
												}}
											/>
											<WordEditorModal
												visible={wordEditorVisible}
												close={closeWordEditorModal}
												entryKey={selectedKey}
											/>
											<DictPopupController
												rootElement={editorContainer}
												selection={selection}
											/>
											<EditorDocument />
										</div>
									</TabPane>
									<TabPane tab="Elements" key="2">
										<WordsPanel />
									</TabPane>
									<TabPane tab="Debug" key="3">
										<pre>
											{JSON.stringify(
												editor.children,
												null,
												2
											)}
										</pre>
									</TabPane>
								</Tabs>
							</Slate>
						</div>
					</div>
				</Spin>
			</div>
		</div>
	);
};

export default YiEditor;
