import './DictEntryEdit.css';
import React, {
	useCallback,
	useReducer,
	useEffect,
	useImperativeHandle,
	forwardRef,
	useState,
} from 'react';
import { Form } from 'antd';
import { IDictionaryEntry, IDictionaryTag } from 'Document/Dictionary';
import { StoreMap } from 'store';
import { getUUID } from 'Document/UUID';
import TagForm, {
	ITagFormFields,
} from '@components/DictionaryEntry/TagForm/TagForm';
import { useSelector } from 'react-redux';
import { selectActiveLanguageConfig } from '@store/user/selectors';
import handleError from '@helpers/Error';
import EntryForm, { IEntryFormFields } from '../EntryForm/EntryForm';

export interface IWordInputState {
	root: string | IDictionaryEntry;
	localDictionary?: StoreMap<IDictionaryEntry>;
	userTags: Array<IDictionaryTag>;
	stateChanged?: (stage: WordEditorMode) => void;
}

export type WordEditorMode = 'word' | 'tag' | 'root';

interface IWordEditorState {
	mode: WordEditorMode;
}

type WordReducerAction =
	| {
			type: 'pushState';
			payload: {
				newState: IWordEditorState;
				stateChanged?: (stage: WordEditorMode) => void;
			};
	  }
	| {
			type: 'popState';
			payload: { stateChanged?: (stage: WordEditorMode) => void };
	  };

interface IWordReducerState {
	currentState: IWordEditorState;
	stateHistory: Array<IWordEditorState>;
}

const wordStateReducer: React.Reducer<IWordReducerState, WordReducerAction> = (
	state,
	action
) => {
	switch (action.type) {
		case 'pushState': {
			action.payload.stateChanged?.(action.payload.newState.mode);
			return {
				currentState: action.payload.newState,
				stateHistory: [...state.stateHistory, state.currentState],
			};
		}
		case 'popState': {
			if (state.stateHistory.length > 0) {
				const newHistory = [...state.stateHistory];
				const newMode = newHistory.pop();
				if (newMode) {
					action.payload.stateChanged?.(newMode.mode);
					return { currentState: newMode, stateHistory: newHistory };
				}
			}
			return state;
		}
		default:
			return state;
	}
};

const INITIAL_WORD_REDUCER_STATE: IWordReducerState = {
	currentState: { mode: 'word' as const },
	stateHistory: new Array<IWordEditorState>(),
};

type FinishCallbackReturn =
	| {
			isDone: true;
			entry: IEntryFormFields;
	  }
	| { isDone: false };

export interface IWordInputRef {
	cancel: () => boolean;
	finish: () => Promise<FinishCallbackReturn>;
}

const WordInput: React.ForwardRefRenderFunction<
	IWordInputRef,
	IWordInputState
> = ({ root, userTags, localDictionary, stateChanged }, ref) => {
	const [wordForm] = Form.useForm<IEntryFormFields>();
	const [rootForm] = Form.useForm<IEntryFormFields>();
	const [tagForm] = Form.useForm<ITagFormFields>();
	const [createdTags, setCreatedTags] = useState<Array<IDictionaryTag>>([]);
	const [wordEditorState, dispatchWordEditorState] = useReducer(
		wordStateReducer,
		INITIAL_WORD_REDUCER_STATE
	);
	const selectedLanguage = useSelector(selectActiveLanguageConfig);

	useEffect(() => {
		if (typeof root === 'string') {
			wordForm.setFieldsValue({ key: root });
		} else {
			wordForm.setFieldsValue(root);
		}
	}, [root, wordForm]);

	const createTagCallback = useCallback(
		async (tagName: string) => {
			let createdId = null;
			try {
				if (!selectedLanguage) {
					throw new Error('No language selected!');
				}
				tagForm.setFieldsValue({
					name: tagName,
					lang: selectedLanguage.key,
				});
				dispatchWordEditorState({
					type: 'pushState',
					payload: { newState: { mode: 'tag' }, stateChanged },
				});
				createdId = getUUID();
			} catch (e) {
				handleError(e);
			}
			return createdId;
		},
		[selectedLanguage, stateChanged, tagForm]
	);

	const createRootCallback = useCallback(
		async (key: string) => {
			let createdId = null;
			try {
				if (!selectedLanguage) {
					throw new Error('No language selected!');
				}
				rootForm.setFieldsValue({ key, lang: selectedLanguage.key });
				dispatchWordEditorState({
					type: 'pushState',
					payload: { newState: { mode: 'root' }, stateChanged },
				});
				createdId = getUUID();
			} catch (e) {
				handleError(e);
			}
			return createdId;
		},
		[rootForm, selectedLanguage, stateChanged]
	);

	const finish = useCallback(async () => {
		let result: FinishCallbackReturn = { isDone: false };
		if (wordEditorState.currentState.mode === 'word') {
			try {
				const wordFormData = await wordForm.validateFields();
				result = { isDone: true, entry: wordFormData };
				wordForm.resetFields();
			} catch (e) {
				// The forms will show appropriate erros themselfes.
			}
		} else if (wordEditorState.currentState.mode === 'tag') {
			try {
				const tagValues = await tagForm.validateFields();
				tagForm.resetFields();
				const cleanedUpTagValues = {
					...tagValues,
					id: getUUID(),
					grammarPoint: tagValues.grammarPoint?.name
						? tagValues.grammarPoint
						: undefined,
				};
				setCreatedTags((currentTags) => [
					...currentTags,
					cleanedUpTagValues,
				]);
				if (wordEditorState.stateHistory.length > 0) {
					const previousState =
						wordEditorState.stateHistory[
							wordEditorState.stateHistory.length - 1
						];
					let targetForm;
					if (previousState.mode === 'word') {
						targetForm = wordForm;
					} else {
						targetForm = rootForm;
					}
					const currentFormValues = targetForm.getFieldsValue(true);
					targetForm.setFieldsValue({
						...currentFormValues,
						tags: [
							...(currentFormValues.tags || []),
							cleanedUpTagValues,
						],
					});
				}
				dispatchWordEditorState({
					type: 'popState',
					payload: { stateChanged },
				});
			} catch (e) {
				// The forms will show appropriate erros themselfes.
			}
		} else {
			try {
				const rootValues = await rootForm.validateFields();
				rootForm.resetFields();
				const currentWordFormValues = wordForm.getFieldsValue(true);
				wordForm.setFieldsValue({
					...currentWordFormValues,
					root: { ...rootValues, id: getUUID() },
				});
				dispatchWordEditorState({
					type: 'popState',
					payload: { stateChanged },
				});
			} catch (e) {
				// The forms will show appropriate erros themselfes.
			}
		}
		return result;
	}, [
		rootForm,
		stateChanged,
		tagForm,
		wordEditorState.currentState.mode,
		wordEditorState.stateHistory,
		wordForm,
	]);

	const cancel = useCallback(() => {
		let isDone;
		if (wordEditorState.currentState.mode === 'word') {
			isDone = true;
		} else {
			dispatchWordEditorState({
				type: 'popState',
				payload: { stateChanged },
			});
			isDone = false;
		}
		return isDone;
	}, [stateChanged, wordEditorState.currentState.mode]);

	useImperativeHandle(ref, () => ({ finish, cancel }), [cancel, finish]);

	const canEditRoot = typeof root === 'string' && root === '';

	return (
		<div>
			{wordEditorState.currentState.mode === 'word' && (
				<EntryForm
					form={wordForm}
					canEditRoot={canEditRoot}
					createTag={createTagCallback}
					createRoot={createRootCallback}
					localDictionary={localDictionary}
					allTags={[...userTags, ...createdTags]}
				/>
			)}
			{wordEditorState.currentState.mode === 'root' && (
				<EntryForm
					form={rootForm}
					createTag={createTagCallback}
					localDictionary={localDictionary}
					allTags={[...userTags, ...createdTags]}
				/>
			)}
			{wordEditorState.currentState.mode === 'tag' && (
				<TagForm form={tagForm} />
			)}
		</div>
	);
};

export default forwardRef(WordInput);
