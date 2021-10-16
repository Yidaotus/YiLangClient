import './Editor.css';
import React, { useCallback, useState } from 'react';

import { Tabs, Spin, notification, Modal } from 'antd';

import { useDispatch, useSelector } from 'react-redux';
import { selectActiveLanguageConfig } from '@store/user/selectors';
import { fetchTags, saveDictionary, saveTags } from 'store/dictionary/actions';
import { IRootDispatch } from 'store';
import handleError from '@helpers/Error';

import EditorDocument from './EditorDocument';

const { TabPane } = Tabs;
const { confirm } = Modal;

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
							</Tabs>
						</div>
					</div>
				</Spin>
			</div>
		</div>
	);
};

export default YiEditor;
