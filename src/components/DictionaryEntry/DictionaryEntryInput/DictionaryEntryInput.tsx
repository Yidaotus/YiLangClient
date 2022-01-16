import React, { useCallback, useReducer, useState } from 'react';
import {
	DictionaryEntryID,
	isEphemeralEntry,
	isEphemeralTag,
	isPersistedEntry,
	isPersistedTag,
} from 'Document/Utility';
import {
	IDictionaryEntry,
	IDictionaryEntryResolved,
} from 'Document/Dictionary';
import TagForm, {
	ITagFormOutput,
	ITagFormDefaults,
} from '@components/DictionaryEntry/TagForm/TagForm';
import { useAddDictionaryTag } from '@hooks/useTags';
import {
	useAddDictionaryEntry,
	useUpdateDictionaryEntry,
} from '@hooks/DictionaryQueryHooks';
import EntryForm, {
	IDictionaryEntryInput,
	IEntryFormOutput,
	INITIAL_ENTRY_FORM_VALUES,
} from '../EntryForm/EntryForm';
import useUiErrorHandler from '@helpers/Error';
import RootForm, {
	IDictionaryRootInput,
	INITIAL_ROOT_FORM_VALUES,
	IRootFormOutput,
} from '../RootForm/RootForm';

export type EntryInputMode = 'word' | 'tag' | 'root';
type EntryInputReducerAction =
	| {
			type: 'pushState';
			payload: {
				newState: EntryInputMode;
				stateChanged?: (stage: EntryInputMode) => void;
			};
	  }
	| {
			type: 'popState';
			payload: { stateChanged?: (stage: EntryInputMode) => void };
	  };
interface EntryInputReducerState {
	currentState: EntryInputMode;
	stateHistory: Array<EntryInputMode>;
}
const entryInputStateReducer: React.Reducer<
	EntryInputReducerState,
	EntryInputReducerAction
> = (state, action) => {
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

const INITIAL_ENTRY_INPUT_REDUCER_STATE: EntryInputReducerState = {
	currentState: 'word',
	stateHistory: new Array<EntryInputMode>(),
};

interface DictionaryEntryInputProps {
	entryKey: string | IDictionaryEntryResolved;
	onStateChange?: (state: EntryInputMode) => void;
	onCancel: () => void;
	onFinish: (resultId: DictionaryEntryID) => void;
}

const isEntryInput = (
	input: IDictionaryRootInput | IDictionaryEntryInput
): input is IDictionaryEntryInput => {
	return 'roots' in input && Array.isArray(input.roots);
};

const DictionaryEntryInput: React.FC<DictionaryEntryInputProps> = ({
	entryKey,
	onStateChange,
	onCancel,
	onFinish,
}) => {
	const [entryInputState, dispatchEntryInputState] = useReducer(
		entryInputStateReducer,
		INITIAL_ENTRY_INPUT_REDUCER_STATE
	);
	const addTag = useAddDictionaryTag();
	const updateEntry = useUpdateDictionaryEntry();
	const addEntry = useAddDictionaryEntry();
	const handleError = useUiErrorHandler();

	const [tagFormDefaults, setTagFormDefaults] = useState<ITagFormDefaults>();

	const [rootFormState, setRootFormState] = useState<IDictionaryRootInput>(
		INITIAL_ROOT_FORM_VALUES
	);
	const [entryFormState, setEntryFormState] = useState<IDictionaryEntryInput>(
		{
			...INITIAL_ENTRY_FORM_VALUES,
			...(typeof entryKey === 'string' ? { key: entryKey } : entryKey),
		}
	);

	const createTag = useCallback(
		(
			tagName: string,
			formState: IDictionaryEntryInput | IDictionaryRootInput
		) => {
			setTagFormDefaults({
				name: tagName,
			});
			if (isEntryInput(formState)) {
				setEntryFormState(formState);
			} else {
				setRootFormState(formState);
			}
			dispatchEntryInputState({
				type: 'pushState',
				payload: { newState: 'tag', stateChanged: onStateChange },
			});
		},
		[onStateChange]
	);

	const createRoot = useCallback(
		async (initialKey: string, formState: IDictionaryEntryInput) => {
			setRootFormState({ ...rootFormState, key: initialKey });
			setEntryFormState(formState);
			dispatchEntryInputState({
				type: 'pushState',
				payload: { newState: 'root', stateChanged: onStateChange },
			});
		},
		[rootFormState, onStateChange]
	);

	const saveEntry = useCallback(
		async (entryInput: IEntryFormOutput): Promise<DictionaryEntryID> => {
			const persistedRoots = entryInput.roots
				.filter(isPersistedEntry)
				.map((root) => root.id);
			const newRoots = entryInput.roots.filter(isEphemeralEntry);
			const newRootsPromises = newRoots.map((unsavedRoot) =>
				saveEntry({ ...unsavedRoot, roots: [] })
			);
			const newRootsIds = await Promise.all(newRootsPromises);
			const rootIds = [...persistedRoots, ...newRootsIds];

			const persistedTags = entryInput.tags
				.filter(isPersistedTag)
				.map((tag) => tag.id);
			const newTags = entryInput.tags.filter(isEphemeralTag);
			const tagPromises = newTags.map((newTag) =>
				addTag.mutateAsync(newTag)
			);
			const newTagsIds = await Promise.all(tagPromises);
			const tagIds = [...persistedTags, ...newTagsIds];

			const entryToUpsert:
				| IDictionaryEntry
				| Omit<IDictionaryEntry, 'id' | 'lang' | 'createdAt'> = {
				...entryInput,
				roots: rootIds,
				tags: tagIds,
			};

			let resultId: DictionaryEntryID;
			if (isPersistedEntry(entryToUpsert)) {
				await updateEntry.mutateAsync(entryToUpsert);
				resultId = entryToUpsert.id;
			} else {
				resultId = await addEntry.mutateAsync(entryToUpsert);
			}
			return resultId;
		},
		[addEntry, addTag, updateEntry]
	);

	const finish = useCallback(
		async (entry: IEntryFormOutput) => {
			try {
				const resultId = await saveEntry(entry);
				onFinish(resultId);
			} catch (e) {
				handleError(e);
			}
		},
		[handleError, onFinish, saveEntry]
	);

	const onSubmitRoot = (newRoot: IRootFormOutput) => {
		setEntryFormState({
			...entryFormState,
			roots: [...(entryFormState.roots || []), newRoot],
		});
		dispatchEntryInputState({
			type: 'popState',
			payload: { stateChanged: onStateChange },
		});
	};

	const onSubmitTag = (newTag: ITagFormOutput) => {
		const previousState =
			entryInputState.stateHistory[
				entryInputState.stateHistory.length - 1
			];
		if (previousState === 'word') {
			setEntryFormState({
				...entryFormState,
				tags: [...(entryFormState.tags || []), newTag],
			});
		} else {
			setRootFormState({
				...rootFormState,
				tags: [...(rootFormState.tags || []), newTag],
			});
		}
		dispatchEntryInputState({
			type: 'popState',
			payload: { stateChanged: onStateChange },
		});
	};

	const cancel = useCallback(() => {
		const isDone = entryInputState.currentState === 'word';
		if (!isDone) {
			dispatchEntryInputState({
				type: 'popState',
				payload: { stateChanged: onStateChange },
			});
		} else {
			onCancel();
		}
	}, [onStateChange, entryInputState.currentState, onCancel]);

	return (
		<div>
			{entryInputState.currentState === 'word' && (
				<div
					// Form has some popovers which are rendered outside this node,
					// to make clickOutSide and other stuff work, stop propagation
					onMouseDown={(e) => {
						e.stopPropagation();
					}}
				>
					<EntryForm
						createTag={createTag}
						createRoot={createRoot}
						formState={entryFormState}
						cancelLabel="Cancel"
						submitLabel="Save"
						onSubmit={finish}
						onCancel={cancel}
					/>
				</div>
			)}
			{entryInputState.currentState === 'root' && (
				<RootForm
					createTag={createTag}
					formState={rootFormState}
					cancelLabel="Cancel"
					submitLabel="Save"
					onSubmit={onSubmitRoot}
					onCancel={cancel}
				/>
			)}
			{entryInputState.currentState === 'tag' && (
				<TagForm
					defaultValues={tagFormDefaults}
					onSubmit={onSubmitTag}
					cancelLabel="Cancel"
					submitLabel="Save"
					onCancel={cancel}
				/>
			)}
		</div>
	);
};

export default DictionaryEntryInput;
