import './SentenceEditorModal.css';
import React, { useCallback, useEffect, useState } from 'react';
import { Editor, Transforms, Selection, Element as SlateElement } from 'slate';
import { useSlateStatic } from 'slate-react';
import { SentenceElement, WordElement } from '@components/Editor/CustomEditor';
import usePrevious from '@hooks/usePreviousState';
import {
	useAddDictionarySentence,
	useLinkWordSentence,
} from '@hooks/DictionaryQueryHooks';
import { Button, Classes, Dialog, InputGroup } from '@blueprintjs/core';
import { IDictionarySentence } from '../../../../../Document/Dictionary';

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
	const addDictionarySentence = useAddDictionarySentence();
	const linkWordSentence = useLinkWordSentence();

	const wrapWithSentence = useCallback(
		({ translation, id }: { translation: string; id: string }) => {
			if (savedSelection) {
				const sentence: SentenceElement = {
					type: 'sentence',
					translation,
					children: [{ text: '' }],
					sentenceId: id,
				};
				Transforms.wrapNodes(editor, sentence, {
					split: true,
					at: savedSelection,
				});
			}
		},
		[editor, savedSelection]
	);

	const linkInnerWords = useCallback(
		(sentenceId: string) => {
			if (savedSelection) {
				const wordNodes = Editor.nodes(editor, {
					at: savedSelection,
					mode: 'all',
					match: (node): node is WordElement =>
						SlateElement.isElement(node) && node.type === 'word',
				});
				for (const [wordNode, wordPath] of wordNodes) {
					linkWordSentence.mutate({
						wordId: wordNode.dictId,
						sentenceId,
					});
				}
			}
		},
		[editor, linkWordSentence, savedSelection]
	);

	const saveSentence = useCallback(
		async (sentence: Omit<IDictionarySentence, 'id' | 'lang'>) => {
			const sentenceId = await addDictionarySentence.mutateAsync(
				sentence
			);
			return sentenceId;
		},
		[addDictionarySentence]
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

	const finish = async () => {
		setTranslationInput('');
		const newSentenceId = await saveSentence({
			content: sentenceKey,
			translation: translationInput,
		});
		await linkInnerWords(newSentenceId);
		wrapWithSentence({ translation: translationInput, id: newSentenceId });
		close();
	};

	const cancel = () => {
		setTranslationInput('');
		close();
	};

	return (
		<Dialog
			isOpen={visible}
			title={<div className="sentence-input-head">Sentence Editor</div>}
			onClose={close}
		>
			<div className={Classes.DIALOG_BODY}>
				<div className="sentence-input-form">
					<p>{sentenceKey}</p>
					<InputGroup
						placeholder="Translation..."
						value={translationInput}
						onChange={(e) => {
							setTranslationInput(e.target.value);
						}}
						onKeyDown={(e) => {
							if (e.key === 'Enter') {
								finish();
							}
						}}
					/>
				</div>
				<div className={Classes.DIALOG_FOOTER_ACTIONS}>
					<Button icon="stop" key="discard" onClick={cancel} />
					<Button icon="saved" key="save" onClick={() => finish()} />
				</div>
			</div>
		</Dialog>
	);
};

export default React.memo(SentenceEditorModal);
