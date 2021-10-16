import './Toolbar.css';
import React, { useEffect, useReducer, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Divider } from 'antd';

import { IRootDispatch } from 'store';

import { selectActiveLookupSources } from '@store/user/selectors';
import { ReactEditor, useSlate } from 'slate-react';
import { Editor, Element as SlateElement, Range, Transforms } from 'slate';
import { TranslationOutlined } from '@ant-design/icons';
import { saveOrUpdateEntryInput } from '@store/dictionary/actions';
import SimpleInput, { useSimpleInput } from './Modals/SimpleInput';
import Floating, { floatingReducer } from '../Popups/Floating';

import WordInput, { useWordInput } from './Modals/WordEditor/WordEditor';
import ColorPicker from './Tools/ColorPicker';
import { isNodeInSelection, VocabElement } from '../CustomEditor';
import WrapperItem from './Tools/WrapperItem';

type IToolbarState =
	| {
			actionBarVisible: true;
			simpleInputVisible: false;
			wordInputVisible: false;
	  }
	| {
			actionBarVisible: false;
			simpleInputVisible: true;
			wordInputVisible: false;
	  }
	| {
			actionBarVisible: false;
			simpleInputVisible: false;
			wordInputVisible: true;
	  };

const defaultToolbarState: IToolbarState = {
	actionBarVisible: true,
	simpleInputVisible: false,
	wordInputVisible: false,
} as const;

const Toolbar: React.FC<{ rootElement: React.RefObject<HTMLElement> }> = ({
	rootElement,
}) => {
	const editor = useSlate();
	const { simpleInputState, getUserInput } = useSimpleInput();
	const { wordInputState, getUserWord } = useWordInput();

	const dispatch: IRootDispatch = useDispatch();
	const lookupSources = useSelector(selectActiveLookupSources);

	const [toolbarState, setToolbarState] =
		useState<IToolbarState>(defaultToolbarState);
	const [toolbarContainerState, dispatchToolbarContainerState] = useReducer(
		floatingReducer,
		{
			visible: false,
			position: {
				x: 0,
				y: 0,
				width: 0,
				height: 0,
			},
		}
	);

	useEffect(() => {
		const rootNode = rootElement.current;
		if (
			!toolbarState.simpleInputVisible &&
			!toolbarState.wordInputVisible &&
			rootNode
		) {
			if (editor.selection && !Range.isCollapsed(editor.selection)) {
				const range = ReactEditor.toDOMRange(editor, editor.selection);
				const rangeBounding = range?.getBoundingClientRect();
				const containerBounding = rootNode.getBoundingClientRect();

				if (rangeBounding && containerBounding) {
					const posX = rangeBounding.x + rangeBounding.width * 0.5;
					const posY = rangeBounding.y + rangeBounding.height;

					const relativeX = posX - containerBounding.x;
					const relativeY = posY - containerBounding.y;
					dispatchToolbarContainerState({
						type: 'show',
						position: {
							x: relativeX,
							y: relativeY,
							width: rangeBounding.width,
							height: rangeBounding.height,
						},
					});
				}

				// Fix document selection not representing slate selection
				// for example after clicking a toolbar button
				const domSelection = document.getSelection();
				if (domSelection?.isCollapsed && !range.collapsed) {
					document.getSelection()?.removeAllRanges();
					document.getSelection()?.addRange(range);
				}
			} else {
				dispatchToolbarContainerState({ type: 'hide' });
			}
		}
	}, [editor, editor.selection, rootElement, toolbarState]);

	const wrapWithWord = async () => {
		if (editor.selection) {
			const savedSelection = editor.selection;
			setToolbarState({
				actionBarVisible: false,
				simpleInputVisible: false,
				wordInputVisible: true,
			});
			const root = Editor.string(editor, editor.selection, {
				voids: true,
			});
			const entry = await getUserWord(root);
			if (entry) {
				const saveResult = dispatch(saveOrUpdateEntryInput(entry));
				if (saveResult) {
					let mainId;
					if (typeof saveResult === 'string') {
						mainId = saveResult;
					} else {
						[mainId] = saveResult;
					}
					const vocab: VocabElement = {
						type: 'vocab',
						wordId: mainId,
						children: [{ text: '' }],
					};
					Transforms.wrapNodes(editor, vocab, {
						at: savedSelection,
						split: true,
					});
				}
			}
			setToolbarState({
				actionBarVisible: true,
				simpleInputVisible: false,
				wordInputVisible: false,
			});
		}
	};

	return (
		<Floating state={toolbarContainerState}>
			{toolbarState.simpleInputVisible && (
				<div tabIndex={0} role="button">
					<SimpleInput {...simpleInputState} />
				</div>
			)}
			{toolbarState.wordInputVisible && (
				<div tabIndex={0} role="button">
					<WordInput {...wordInputState} />
				</div>
			)}
			{toolbarState.actionBarVisible && (
				<div className="toolbar">
					<ColorPicker editor={editor} />
					<Divider
						type="vertical"
						style={{
							margin: '0 0px !important',
							borderLeft: '1px solid rgb(0 0 0 / 27%)',
						}}
					/>
					<WrapperItem
						icon={<TranslationOutlined />}
						tooltip="word"
						tooltipActive="word"
						active={isNodeInSelection(
							editor,
							editor.selection,
							'vocab'
						)}
						name="word"
						visible
						wrap={wrapWithWord}
						unwrap={async () => {
							Transforms.unwrapNodes(editor, {
								voids: true,
								match: (n) => {
									return (
										SlateElement.isElement(n) &&
										n.type === 'vocab'
									);
								},
							});
						}}
					/>
				</div>
			)}
		</Floating>
	);
};

export default Toolbar;
