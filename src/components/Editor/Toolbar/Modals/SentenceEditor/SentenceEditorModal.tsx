import './SentenceEditorModal.css';
import React, { useCallback, useEffect, useState } from 'react';
import { Button, Modal, Input } from 'antd';
import { SaveOutlined, StopOutlined } from '@ant-design/icons';
import { Editor, Transforms, Selection } from 'slate';
import { useSlateStatic } from 'slate-react';
import { SentenceElement } from '@components/Editor/CustomEditor';
import usePrevious from '@hooks/usePreviousState';

export interface ISentenceModalProps {
	visible: boolean;
	close: () => void;
}

const SentenceEditorModal: React.FC<ISentenceModalProps> = ({
	visible,
	close,
}) => {
	const editor = useSlateStatic();
	const visibleBefore = usePrevious(visible);
	const [savedSelection, setSavedSelection] = useState<Selection>();
	const [sentenceKey, setSentenceKey] = useState('');
	const [translationInput, setTranslationInput] = useState('');

	const wrapWithSentence = useCallback(
		(translation: string) => {
			if (savedSelection) {
				const sentence: SentenceElement = {
					type: 'sentence',
					translation,
					children: [{ text: '' }],
				};
				Transforms.wrapNodes(editor, sentence, {
					split: true,
					at: savedSelection,
				});
			}
		},
		[editor, savedSelection]
	);

	useEffect(() => {
		if (visible && !visibleBefore && editor.selection) {
			setSavedSelection(editor.selection);
			const key = Editor.string(editor, editor.selection, {
				voids: true,
			});
			setSentenceKey(key);
		}
	}, [editor, editor.selection, visible, visibleBefore]);

	const finish = () => {
		setTranslationInput('');
		wrapWithSentence(translationInput);
		close();
	};

	const cancel = () => {
		setTranslationInput('');
		close();
	};

	return (
		<Modal
			centered
			visible={visible}
			closable={false}
			title={<div className="sentence-input-head">Sentence Editor</div>}
			footer={[
				<Button
					icon={<StopOutlined />}
					key="discard"
					onClick={cancel}
				/>,
				<Button
					icon={<SaveOutlined />}
					key="save"
					onClick={() => finish()}
				/>,
			]}
			onCancel={close}
		>
			<div className="sentence-input-form">
				<p>{sentenceKey}</p>
				<Input
					placeholder="Translation..."
					value={translationInput}
					onChange={(e) => {
						setTranslationInput(e.target.value);
					}}
				/>
			</div>
		</Modal>
	);
};

export default React.memo(SentenceEditorModal);
