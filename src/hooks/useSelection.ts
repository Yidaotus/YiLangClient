import areEqual from 'deep-equal';
import { useCallback, useRef, useState, useEffect } from 'react';
import { BaseRange, BaseSelection, Editor, Selection } from 'slate';

const useSelection = (
	editor: Editor
): [BaseRange | null, (newSelection: BaseSelection) => void] => {
	const previousSelection = useRef<Selection>();
	const [selection, setSelection] = useState(editor.selection);
	const setSelectionOptimized = useCallback(
		(newSelection: BaseSelection) => {
			if (areEqual(selection, newSelection)) {
				return;
			}
			setSelection(newSelection);
		},
		[selection, setSelection]
	);

	useEffect(() => {
		previousSelection.current = selection;
	}, [selection]);

	return [selection, setSelectionOptimized];
};

export default useSelection;
