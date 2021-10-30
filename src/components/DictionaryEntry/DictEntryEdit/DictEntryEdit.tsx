import './DictEntryEdit.css';
import React, {
	useCallback,
	useReducer,
	useEffect,
	useImperativeHandle,
	forwardRef,
	useState,
} from 'react';
import { Form, Spin } from 'antd';
import { IDictionaryEntry, IDictionaryTag } from 'Document/Dictionary';
import TagForm, {
	ITagFormFields,
} from '@components/DictionaryEntry/TagForm/TagForm';
import handleError from '@helpers/Error';
import { useTags, useAddDictionaryTag } from '@hooks/useTags';
import {
	useAddDictionaryEntry,
	useUpdateDictionaryEntry,
} from '@hooks/DictionaryQueryHooks';
import { randomBytes } from 'crypto';
import EntryForm, {
	IEntryFormFields,
	IDictionaryEntryInput,
} from '../EntryForm/EntryForm';

export interface IWordInputState {
	entryKey: string | IDictionaryEntry;
	stateChanged?: (stage: WordEditorMode) => void;
}

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

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
> = ({ entryKey, stateChanged }, ref) => {
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
	const updateEntry = useUpdateDictionaryEntry();
	const addEntry = useAddDictionaryEntry();

	useEffect(() => {
		if (typeof entryKey === 'string') {
			wordForm.setFieldsValue({ key: entryKey });
		} else {
			wordForm.setFieldsValue(entryKey);
		}
	}, [entryKey, wordForm]);

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
		async (initialKey: string) => {
			try {
				rootForm.setFieldsValue({ key: initialKey });
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
				let rootId;
				if (input.root && typeof input.root === 'string') {
					rootId = input.root;
				} else if (input.root && typeof input.root === 'object') {
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
					rootId = await addEntry.mutateAsync(rootToCreate);
				}
				const newTagsToSave = input.tags
					.filter(
						(tag): tag is IDictionaryTag => typeof tag === 'object'
					)
					.map((tag) => {
						const { id, ...tagWithoutId } = tag;
						return tagWithoutId;
					});
				const tagPromises = [];
				for (const newTag of newTagsToSave) {
					tagPromises.push(addTag.mutateAsync(newTag));
				}
				const createdTagIds = await Promise.all(tagPromises);

				const entryToUpsert: Optional<IDictionaryEntry, 'id' | 'lang'> =
					{
						...input,
						root: rootId,
						tags: [
							...input.tags.filter(
								(tag): tag is string => typeof tag !== 'object'
							),
							...createdTagIds,
						],
					};

				let resultId;
				if (entryToUpsert.id) {
					await updateEntry.mutateAsync(
						entryToUpsert as IDictionaryEntry
					);
					resultId = entryToUpsert.id;
				} else {
					resultId = await addEntry.mutateAsync(entryToUpsert);
				}
				return resultId;
			} catch (e) {
				handleError(e);
			}
			return null;
		},
		[addEntry, addTag, updateEntry]
	);

	const finish = useCallback(async () => {
		let result: FinishCallbackReturn = { isDone: false };
		if (addTag.isLoading || addEntry.isLoading) {
			return result;
		}
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
					id: String(`etherialTagId${tagValues.name}`),
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
		addEntry.isLoading,
		addTag.isLoading,
		rootForm,
		saveEntry,
		stateChanged,
		tagForm,
		wordEditorState.currentState,
		wordEditorState.stateHistory,
		wordForm,
	]);

	const cancel = useCallback(() => {
		if (addTag.isLoading || addEntry.isLoading) {
			return false;
		}
		const isDone = wordEditorState.currentState === 'word';
		if (!isDone) {
			dispatchWordEditorState({
				type: 'popState',
				payload: { stateChanged },
			});
		} else {
			setCreatedTags([]);
			tagForm.resetFields();
			rootForm.resetFields();
			wordForm.resetFields();
		}
		return isDone;
	}, [
		addEntry.isLoading,
		addTag.isLoading,
		rootForm,
		stateChanged,
		tagForm,
		wordEditorState.currentState,
		wordForm,
	]);

	useImperativeHandle(ref, () => ({ finish, cancel }), [cancel, finish]);
	const canEditRoot = typeof entryKey === 'string' && entryKey === '';
	return (
		<div>
			<Spin spinning={addTag.isLoading || addEntry.isLoading}>
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
			</Spin>
		</div>
	);
};

export default forwardRef(WordInput);
