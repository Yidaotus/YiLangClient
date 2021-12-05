import './DictEntryEdit.css';
import React, {
	useCallback,
	useReducer,
	useEffect,
	useImperativeHandle,
	forwardRef,
	useState,
	useRef,
} from 'react';
import { useForm } from 'react-hook-form';
import {
	IDictionaryEntry,
	IDictionaryEntryResolved,
	IDictionaryTag,
} from 'Document/Dictionary';
import TagForm, {
	INITIAL_TAG_FORM_VALUES,
	IDictionaryTagInput,
} from '@components/DictionaryEntry/TagForm/TagForm';
import handleError from '@helpers/Error';
import { useTags, useAddDictionaryTag } from '@hooks/useTags';
import { Spinner } from '@blueprintjs/core';
import {
	useAddDictionaryEntry,
	useUpdateDictionaryEntry,
} from '@hooks/DictionaryQueryHooks';
import EntryForm, { IDictionaryEntryInput } from '../EntryForm/EntryForm';

export interface IWordInputState {
	entryKey: string | IDictionaryEntryResolved;
	stateChanged?: (stage: WordEditorMode) => void;
	root: Array<IDictionaryEntryResolved>;
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

const isOldRoot = (
	input: IDictionaryEntryInput | IDictionaryEntryResolved
): input is IDictionaryEntryResolved => {
	return 'id' in input && input.id !== undefined;
};

const isUnsavedTag = (
	input: Omit<IDictionaryTag, 'id'> | IDictionaryTag
): input is Omit<IDictionaryTag, 'id'> =>
	!('id' in input) || ('id' in input && input.id === undefined);

const isPersistedTag = (
	input: Omit<IDictionaryTag, 'id'> | IDictionaryTag
): input is IDictionaryTag => 'id' in input && input.id !== undefined;

const WordInput: React.ForwardRefRenderFunction<
	IWordInputRef,
	IWordInputState
> = ({ entryKey, stateChanged, root }, ref) => {
	const previousEntryKey = useRef<string | IDictionaryEntryResolved | null>(
		null
	);
	const wordForm = useForm<IDictionaryEntryInput>();
	const rootForm = useForm<IDictionaryEntryInput>();
	const tagForm = useForm<IDictionaryTagInput>({
		defaultValues: INITIAL_TAG_FORM_VALUES,
	});
	const [createdTags, setCreatedTags] = useState<
		Array<Omit<IDictionaryTag, 'id'> & { id?: string }>
	>([]);
	const [wordEditorState, dispatchWordEditorState] = useReducer(
		wordStateReducer,
		INITIAL_WORD_REDUCER_STATE
	);
	const userTags = useTags();
	const addTag = useAddDictionaryTag();
	const updateEntry = useUpdateDictionaryEntry();
	const addEntry = useAddDictionaryEntry();

	useEffect(() => {
		if (previousEntryKey.current !== entryKey) {
			if (typeof entryKey === 'string') {
				wordForm.reset({
					key: entryKey,
					comment: '',
					tags: [],
					translations: [],
					root: [],
				});
			} else {
				wordForm.reset({ ...entryKey, root });
			}
			previousEntryKey.current = entryKey;
		}
	}, [entryKey, root, wordForm]);

	const createTagCallback = useCallback(
		(tagName: string) => {
			try {
				tagForm.setValue('name', tagName);
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
				rootForm.setValue('key', initialKey, { shouldDirty: true });
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
				const rootIds: Array<string> = [];
				if (input.root) {
					for (const inputRoot of input.root) {
						if (isOldRoot(inputRoot)) {
							rootIds.push(inputRoot.id);
						} else if (!isOldRoot(input)) {
							const newTagsToSave =
								inputRoot.tags.filter(isUnsavedTag);
							const tagPromises = [];
							for (const newTag of newTagsToSave) {
								tagPromises.push(addTag.mutateAsync(newTag));
							}
							// eslint-disable-next-line no-await-in-loop
							const createdTagIds = await Promise.all(
								tagPromises
							);

							const rootToCreate: Omit<
								IDictionaryEntry,
								'id' | 'lang'
							> = {
								...inputRoot,
								root: [],
								tags: [
									...input.tags
										.filter(isPersistedTag)
										.map((pTag) => pTag.id),
									...createdTagIds,
								],
							};
							// eslint-disable-next-line no-await-in-loop
							const rootId = await addEntry.mutateAsync(
								rootToCreate
							);
							rootIds.push(rootId);
						}
					}
				}
				const newTagsToSave = input.tags.filter(isUnsavedTag);
				const tagPromises = [];
				for (const newTag of newTagsToSave) {
					tagPromises.push(addTag.mutateAsync(newTag));
				}
				const createdTagIds = await Promise.all(tagPromises);

				const entryToUpsert: Optional<IDictionaryEntry, 'id' | 'lang'> =
					{
						...input,
						root: rootIds,
						tags: [
							...input.tags
								.filter(isPersistedTag)
								.map((pTag) => pTag.id),
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
				const correct = await wordForm.trigger();
				if (correct) {
					const wordFormData = wordForm.getValues();
					const entryId = await saveEntry(wordFormData);
					result = { isDone: true, entryId };
					setCreatedTags([]);
					tagForm.reset();
					rootForm.reset();
					wordForm.reset();
				}
			} catch (e) {
				// The forms will show appropriate erros themselfes.
			}
		} else if (wordEditorState.currentState === 'tag') {
			try {
				const correct = await tagForm.trigger();
				if (correct) {
					const tagValues = await tagForm.getValues();
					tagForm.reset();
					const cleanedUpTagValues = {
						...tagValues,
						id: undefined,
						grammarPoint: tagValues.grammarPoint?.name
							? {
									name: tagValues.grammarPoint.name,
									description:
										tagValues.grammarPoint.description,
									construction:
										tagValues.grammarPoint.construction?.map(
											(rhfPoint) => rhfPoint.point
										),
							  }
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
						const currentFormValues = targetForm.getValues();
						targetForm.reset(
							{
								...currentFormValues,
								tags: [
									...(currentFormValues.tags || []),
									cleanedUpTagValues,
								],
							},
							{ isDirty: true }
						);
					}
					dispatchWordEditorState({
						type: 'popState',
						payload: { stateChanged },
					});
				}
			} catch (e) {
				handleError(e);
			}
		} else {
			try {
				const correct = await rootForm.trigger();
				if (correct) {
					const rootValues = rootForm.getValues();
					rootForm.reset();
					const currentWordFormValues = wordForm.getValues();
					wordForm.reset({
						...currentWordFormValues,
						root: [...currentWordFormValues.root, rootValues],
					});
					dispatchWordEditorState({
						type: 'popState',
						payload: { stateChanged },
					});
				}
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
			tagForm.reset();
			rootForm.reset();
			wordForm.reset();
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
			{(addTag.isLoading || addEntry.isLoading) && <Spinner />}
			<div
				style={{
					display:
						wordEditorState.currentState === 'word'
							? 'block'
							: 'none',
				}}
			>
				<EntryForm
					form={wordForm}
					canEditRoot={canEditRoot}
					createTag={createTagCallback}
					createRoot={createRootCallback}
					allTags={[...userTags, ...createdTags]}
				/>
			</div>
			<div
				style={{
					display:
						wordEditorState.currentState === 'root'
							? 'block'
							: 'none',
				}}
			>
				<EntryForm
					form={rootForm}
					createTag={createTagCallback}
					allTags={[...userTags, ...createdTags]}
				/>
			</div>
			<div
				style={{
					display:
						wordEditorState.currentState === 'tag'
							? 'block'
							: 'none',
				}}
			>
				<TagForm form={tagForm} />
			</div>
		</div>
	);
};

export default forwardRef(WordInput);
