import './DictEntryEdit.css';
import React, {
	useCallback,
	useReducer,
	useEffect,
	useImperativeHandle,
	forwardRef,
	useRef,
} from 'react';
import { useForm } from 'react-hook-form';
import { DictionaryEntryID, DictionaryTagID } from 'Document/Utility';
import {
	IDictionaryEntry,
	IDictionaryEntryResolved,
	IGrammarPoint,
} from 'Document/Dictionary';
import TagForm, {
	INITIAL_TAG_FORM_VALUES,
	IDictionaryTagInput,
} from '@components/DictionaryEntry/TagForm/TagForm';
import { yupResolver } from '@hookform/resolvers/yup';
import { useAddDictionaryTag } from '@hooks/useTags';
import {
	useAddDictionaryEntry,
	useUpdateDictionaryEntry,
} from '@hooks/DictionaryQueryHooks';
import EntryForm, {
	entrySchema,
	IDictionaryEntryInForm,
	IDictionaryEntryInput,
	IDictionaryTagInForm,
	INITIAL_ENTRY_FORM,
	IRootsInput,
} from '../EntryForm/EntryForm';
import useUiErrorHandler from '@helpers/Error';

export interface IWordInputState {
	entryKey: string | IDictionaryEntryResolved;
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
			entryId: DictionaryEntryID | null;
	  }
	| { isDone: false };

export interface IWordInputRef {
	cancel: () => boolean;
	finish: () => Promise<FinishCallbackReturn>;
}

const isPersistedRoot = (
	input: IDictionaryEntryInput | IDictionaryEntryInForm
): input is IDictionaryEntryInForm => {
	return 'id' in input && !!input.id;
};
const isUnsavedRoot = (
	input: IDictionaryEntryInput | IDictionaryEntryInForm
): input is IDictionaryEntryInput => {
	return !('id' in input) || !!!input.id;
};

const isUnsavedTag = (
	input: IDictionaryTagInput | IDictionaryTagInForm
): input is IDictionaryTagInput => !('id' in input) || !!!input.id;

const isPersistedTag = (
	input: IDictionaryTagInput | IDictionaryTagInForm
): input is IDictionaryTagInForm => 'id' in input && !!input.id;

const WordInput: React.ForwardRefRenderFunction<
	IWordInputRef,
	IWordInputState
> = ({ entryKey, stateChanged }, ref) => {
	const previousEntryKey = useRef<string | IDictionaryEntryResolved | null>(
		null
	);
	const wordForm = useForm<IDictionaryEntryInput>({
		resolver: yupResolver(entrySchema),
		reValidateMode: 'onChange',
		defaultValues: INITIAL_ENTRY_FORM,
	});
	const rootForm = useForm<IDictionaryEntryInput>({
		defaultValues: INITIAL_ENTRY_FORM,
	});
	const tagForm = useForm<IDictionaryTagInput>({
		defaultValues: INITIAL_TAG_FORM_VALUES,
	});
	const [wordEditorState, dispatchWordEditorState] = useReducer(
		wordStateReducer,
		INITIAL_WORD_REDUCER_STATE
	);
	const addTag = useAddDictionaryTag();
	const updateEntry = useUpdateDictionaryEntry();
	const addEntry = useAddDictionaryEntry();
	const handleError = useUiErrorHandler();

	useEffect(() => {
		if (previousEntryKey.current !== entryKey) {
			if (typeof entryKey === 'string') {
				wordForm.reset({ ...INITIAL_ENTRY_FORM, key: entryKey });
			} else {
				wordForm.reset(entryKey);
			}
			previousEntryKey.current = entryKey;
		}
	}, [entryKey, wordForm]);

	const createTag = useCallback(
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
		[handleError, stateChanged, tagForm]
	);

	const createRoot = useCallback(
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
		[handleError, rootForm, stateChanged]
	);

	const saveEntry = useCallback(
		async (input: IDictionaryEntryInput): Promise<DictionaryEntryID> => {
			const persistedRoots = input.roots
				.filter(isPersistedRoot)
				.map((root) => root.id as DictionaryEntryID);
			const newRoots = (
				input.roots as Array<IDictionaryEntryInput>
			).filter(isUnsavedRoot);
			const newRootsPromises = newRoots.map((unsavedRoot) =>
				saveEntry(unsavedRoot)
			);
			const newRootsIds = await Promise.all(newRootsPromises);
			const rootIds: Array<DictionaryEntryID> = [
				...persistedRoots,
				...newRootsIds,
			];

			const persistedTags = input.tags
				.filter(isPersistedTag)
				.map((tag) => tag.id as DictionaryTagID);
			const newTags = input.tags.filter(isUnsavedTag);
			const tagPromises = newTags.map((newTag) => {
				const cleanedUpGrammarPoint: IGrammarPoint = {
					...newTag.grammarPoint,
					construction:
						newTag.grammarPoint.construction?.map(
							(gmc) => gmc.point
						) || [],
				};
				return addTag.mutateAsync({
					...newTag,
					grammarPoint: cleanedUpGrammarPoint.name
						? cleanedUpGrammarPoint
						: undefined,
				});
			});
			const newTagsIds = await Promise.all(tagPromises);
			const tagIds = [...persistedTags, ...newTagsIds];

			const entryToUpsert: Optional<
				IDictionaryEntry,
				'id' | 'lang' | 'createdAt'
			> = {
				...input,
				id: input.id ? (input.id as DictionaryEntryID) : undefined,
				roots: rootIds,
				tags: tagIds,
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
					const wordFormData =
						wordForm.getValues() as IDictionaryEntryInput;
					const entryId = await saveEntry(wordFormData);
					result = {
						isDone: true,
						entryId,
					};
					tagForm.reset(INITIAL_TAG_FORM_VALUES);
					rootForm.reset();
					wordForm.reset();
				}
			} catch (e) {
				handleError(e);
			}
		} else if (wordEditorState.currentState === 'tag') {
			try {
				const correct = await tagForm.trigger();
				if (correct) {
					const tagValues = tagForm.getValues();
					tagForm.reset(INITIAL_TAG_FORM_VALUES);
					if (wordEditorState.stateHistory.length > 0) {
						const previousState =
							wordEditorState.stateHistory[
								wordEditorState.stateHistory.length - 1
							];
						let targetForm =
							previousState === 'word' ? wordForm : rootForm;
						const currentFormValues = targetForm.getValues();
						targetForm.reset({
							...currentFormValues,
							tags: [
								...(currentFormValues.tags || []),
								tagValues,
							],
						});
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
					// Casting because I know it's safe. Maybe not the cleanest solution
					// but the most ergonomic one as for now
					const rootValues = rootForm.getValues() as IRootsInput;
					rootForm.reset();
					const currentWordFormValues = wordForm.getValues();
					wordForm.reset({
						...currentWordFormValues,
						roots: [...currentWordFormValues.roots, rootValues],
					});
					dispatchWordEditorState({
						type: 'popState',
						payload: { stateChanged },
					});
				}
			} catch (e) {
				handleError(e);
			}
		}
		return result;
	}, [
		addEntry.isLoading,
		addTag.isLoading,
		handleError,
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
			tagForm.reset(INITIAL_TAG_FORM_VALUES);
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
			<div
				style={{
					display:
						wordEditorState.currentState === 'word'
							? 'block'
							: 'none',
				}}
			>
				<div
					// Form has some popovers which are rendered outside this node,
					// to make clickOutSide and other stuff work, stop propagation
					onMouseDown={(e) => {
						e.stopPropagation();
					}}
				>
					<EntryForm
						form={wordForm}
						canEditRoot={canEditRoot}
						createTag={createTag}
						createRoot={createRoot}
					/>
				</div>
			</div>
			<div
				style={{
					display:
						wordEditorState.currentState === 'root'
							? 'block'
							: 'none',
				}}
			>
				<EntryForm form={rootForm} createTag={createTag} />
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
