import './Editor.css';
import React, { useCallback, useMemo, useState } from 'react';

import { Tabs, Spin, notification, Modal } from 'antd';

import { useDispatch, useSelector } from 'react-redux';
import { selectActiveLanguageConfig } from '@store/user/selectors';
import { fetchTags, saveDictionary, saveTags } from 'store/dictionary/actions';
import { IRootDispatch } from 'store';
import handleError from '@helpers/Error';

import { Slate, withReact } from 'slate-react';
import { createEditor, Descendant, Editor } from 'slate';
import EditorDocument from './EditorDocument';
import { CustomElement } from './CustomEditor';

const { TabPane } = Tabs;

const withYiLang = (editor: Editor) => {
	const { isInline, isVoid } = editor;
	const inlineTypes: Array<CustomElement['type']> = [
		'word',
		'mark',
		'sentence',
		'highlight',
	];

	const voidTypes: Array<CustomElement['type']> = ['word', 'image'];

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
	const dispatch: IRootDispatch = useDispatch();

	const [loading, setLoading] = useState<string | null>(null);
	const currentLanguage = useSelector(selectActiveLanguageConfig);

	const save = useCallback(async () => {
		setLoading('Saving Dictionary');
		try {
			setLoading('Saving Dictionary');
			await dispatch(saveDictionary());
			setLoading('Saving Tags');
			await dispatch(saveTags());
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
	}, [dispatch]);

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

	const editor = useMemo(() => withYiLang(withReact(createEditor())), []);

	const [editorNodes, setEditorNodes] = useState<Descendant[]>([
		{
			type: 'head',
			level: 1,
			children: [
				{
					text: 'イチゴの中はどうなっている？',
				},
			],
		},
		{
			type: 'head',
			level: 2,
			children: [
				{
					text: 'イチゴの中はどうなっている？',
				},
			],
		},
		{
			type: 'image',
			src: 'https://www.nhk.or.jp/das/image/D0005110/D0005110342_00000_C_001.jpg',
			caption: 'lul123',
			children: [{ text: '' }],
		},
		{
			type: 'paragraph',
			children: [
				{
					text: '今回のミカタは「中を見てみる」。イチゴの中はどうなっているか、街の人に聞いてみました。まず、男の子。「こんな感じだ と思います。まわりが赤くなって、中に粒（つぶ）がある」。中にツブツブ？　続いて女の子。',
				},
				{
					text: '真ん中が白っぽくて空洞（くうどう）になっていて、まわりは赤い」。中に空洞？　若い女の人は、「真ん中が真っ白で、徐々（じょじょ）に赤くなっていく感じ」。真ん中は白い？　みんながかいたイチゴの中。中にツブツブ、中に空洞、真ん中が白い、スジがある…。実際はどうなっているのでしょう。',
				},
			],
		},
	]);

	// If we change our Document we need to check if we have stored caret
	// and restore if this is the case.
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
								onChange={(newValue) =>
									setEditorNodes(newValue)
								}
							>
								<Tabs
									defaultActiveKey="1"
									centered
									tabBarStyle={{
										position: 'sticky',
									}}
								>
									<TabPane tab="Document" key="1">
										<EditorDocument />
									</TabPane>
									<TabPane tab="Elements" key="2" />
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
