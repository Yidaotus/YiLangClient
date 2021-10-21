import areEqual from 'deep-equal';
import { useCallback, useState } from 'react';
import { BaseRange, BaseSelection, Editor } from 'slate';

const useSelection = (
	editor: Editor
): [BaseRange | null, (newSelection: BaseSelection) => void] => {
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

	return [selection, setSelectionOptimized];
};

export default useSelection;
