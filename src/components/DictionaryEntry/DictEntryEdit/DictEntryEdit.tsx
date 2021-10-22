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
import TagForm, {
	ITagFormFields,
} from '@components/DictionaryEntry/TagForm/TagForm';
import handleError from '@helpers/Error';
import { useTags, useAddDictionaryTag } from '@hooks/useTags';
import { useAddDictionaryEntry } from '@hooks/DictionaryQueryHooks';
import { randomBytes } from 'crypto';
import EntryForm, {
	IEntryFormFields,
	IDictionaryEntryInput,
} from '../EntryForm/EntryForm';

export interface IWordInputState {
	root: string | IDictionaryEntry;
	stateChanged?: (stage: WordEditorMode) => void;
}

export type WordEditorMode = 'word' | 'tag' | 'root';
type WordReducerAction =
	| {
			type: 'pushState';
			payload: {
				newState: WordEditorMode;
				stateChanged?: (stage: WordEditorMode) => void;
			};
	  }
	| {
			type: 'popState';
			payload: { stateChanged?: (stage: WordEditorMode) => void };
	  };

interface IWordReducerState {
	currentState: WordEditorMode;
	stateHistory: Array<WordEditorMode>;
}

const wordStateReducer: React.Reducer<IWordReducerState, WordReducerAction> = (
	state,
	action
) => {
	switch (action.type) {
		case 'pushState': {
			action.payload.stateChanged?.(action.payload.newState);
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
					action.payload.stateChanged?.(newMode);
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
	currentState: 'word',
	stateHistory: new Array<WordEditorMode>(),
};

type FinishCallbackReturn =
	| {
			isDone: true;
			entryId: string | null;
	  }
	| { isDone: false };

export interface IWordInputRef {
	cancel: () => boolean;
	finish: () => Promise<FinishCallbackReturn>;
}

const WordInput: React.ForwardRefRenderFunction<
	IWordInputRef,
	IWordInputState
> = ({ root, stateChanged }, ref) => {
	const [wordForm] = Form.useForm<IEntryFormFields>();
	const [rootForm] = Form.useForm<IEntryFormFields>();
	const [tagForm] = Form.useForm<ITagFormFields>();
	const [createdTags, setCreatedTags] = useState<Array<IDictionaryTag>>([]);
	const [wordEditorState, dispatchWordEditorState] = useReducer(
		wordStateReducer,
		INITIAL_WORD_REDUCER_STATE
	);
	const userTags = useTags();
	const addTag = useAddDictionaryTag();
	const addEntry = useAddDictionaryEntry();

	useEffect(() => {
		if (typeof root === 'string') {
			wordForm.setFieldsValue({ key: root });
		} else {
			wordForm.setFieldsValue(root);
		}
	}, [root, wordForm]);

	const createTagCallback = useCallback(
		async (tagName: string) => {
			try {
				tagForm.setFieldsValue({
					name: tagName,
				});
				dispatchWordEditorState({
					type: 'pushState',
					payload: { newState: 'tag', stateChanged },
				});
			} catch (e) {
				handleError(e);
			}
		},
		[stateChanged, tagForm]
	);

	const createRootCallback = useCallback(
		async (key: string) => {
			try {
				rootForm.setFieldsValue({ key });
				dispatchWordEditorState({
					type: 'pushState',
					payload: { newState: 'root', stateChanged },
				});
			} catch (e) {
				handleError(e);
			}
		},
		[rootForm, stateChanged]
	);

	const saveEntry = useCallback(
		async (input: IDictionaryEntryInput): Promise<string | null> => {
			// We have  new root entry
			try {
				if (input.root && typeof input.root === 'object') {
					const newTagsToSave = input.root.tags.filter(
						(tag): tag is IDictionaryTag => typeof tag === 'object'
					);
					const tagPromises = [];
					for (const newTag of newTagsToSave) {
						tagPromises.push(addTag.mutateAsync(newTag));
					}
					const createdTagIds = await Promise.all(tagPromises);

					const rootToCreate: Omit<IDictionaryEntry, 'id' | 'lang'> =
						{
							...input.root,
							root: undefined,
							tags: [
								...input.tags.filter(
									(tag): tag is string =>
										typeof tag !== 'object'
								),
								...createdTagIds,
							],
						};
					addEntry.mutate(rootToCreate);
				}
				const newTagsToSave = input.tags.filter(
					(tag): tag is IDictionaryTag => typeof tag === 'object'
				);
				const tagPromises = [];
				for (const newTag of newTagsToSave) {
					tagPromises.push(addTag.mutateAsync(newTag));
				}
				const createdTagIds = await Promise.all(tagPromises);

				const entryToCreate: Omit<IDictionaryEntry, 'id' | 'lang'> = {
					...input,
					root: undefined,
					tags: [
						...input.tags.filter(
							(tag): tag is string => typeof tag !== 'object'
						),
						...createdTagIds,
					],
				};
				const createdId = await addEntry.mutateAsync(entryToCreate);
				return createdId;
			} catch (e) {
				handleError(e);
			}
			return null;
		},
		[addEntry, addTag]
	);

	const finish = useCallback(async () => {
		let result: FinishCallbackReturn = { isDone: false };
		if (wordEditorState.currentState === 'word') {
			try {
				const wordFormData = await wordForm.validateFields();
				const entryId = await saveEntry(wordFormData);
				result = { isDone: true, entryId };
				setCreatedTags([]);
				tagForm.resetFields();
				rootForm.resetFields();
				wordForm.resetFields();
			} catch (e) {
				// The forms will show appropriate erros themselfes.
			}
		} else if (wordEditorState.currentState === 'tag') {
			try {
				const tagValues = await tagForm.validateFields();
				tagForm.resetFields();
				const cleanedUpTagValues = {
					...tagValues,
					id: String(randomBytes(12)),
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
					if (previousState === 'word') {
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
					root: { ...rootValues },
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
		saveEntry,
		stateChanged,
		tagForm,
		wordEditorState.currentState,
		wordEditorState.stateHistory,
		wordForm,
	]);

	const cancel = useCallback(() => {
		const isDone = wordEditorState.currentState === 'word';
		if (!isDone) {
			dispatchWordEditorState({
				type: 'popState',
				payload: { stateChanged },
			});
		}
		setCreatedTags([]);
		tagForm.resetFields();
		rootForm.resetFields();
		wordForm.resetFields();
		return isDone;
	}, [
		rootForm,
		stateChanged,
		tagForm,
		wordEditorState.currentState,
		wordForm,
	]);

	useImperativeHandle(ref, () => ({ finish, cancel }), [cancel, finish]);
	const canEditRoot = typeof root === 'string' && root === '';
	return (
		<div>
			{wordEditorState.currentState === 'word' && (
				<EntryForm
					form={wordForm}
					canEditRoot={canEditRoot}
					createTag={createTagCallback}
					createRoot={createRootCallback}
					allTags={[...userTags, ...createdTags]}
				/>
			)}
			{wordEditorState.currentState === 'root' && (
				<EntryForm
					form={rootForm}
					createTag={createTagCallback}
					allTags={[...userTags, ...createdTags]}
				/>
			)}
			{wordEditorState.currentState === 'tag' && (
				<TagForm form={tagForm} />
			)}
		</div>
	);
};

export default forwardRef(WordInput);
