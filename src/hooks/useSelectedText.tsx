import { findNodeByDataType, isChild, sumUpNodes } from '@helpers/DomHelper';
import { BLOCKDATAID } from '@editor/Blocks/BlockContainer/BlockContainer';
import { useCallback, useEffect, useRef } from 'react';
import { FRAGMENTABLETYPEID } from 'Document/Fragment';
import { getUUID } from 'Document/UUID';
import { IDocumentSelection } from 'Document/Document';
import { useDispatch } from 'react-redux';
import { setSelection } from '@store/editor/actions';

export interface IScreenPosition {
	y: number;
	x: number;
	width: number;
	height: number;
}

export interface ISelection {
	screenPosition: IScreenPosition;
	focusPosition: IScreenPosition;
	value: string;
	collapsed: boolean;
	documentSelection: IDocumentSelection;
	rootId: string;
}

const SELECTIONBLOCKER = 'selection-blocker';

/**
 * Returns the user selection of the provied dom element. Position is *always* relative
 * to this root element. This includes the position of the selected text AND the
 * screen position! You need to normalize them accordingly. Selection change causes a
 * rerender.
 *
 * @param rootElement the root DOM Element where the selection should be captured from.
 * @returns the selection
 */
function useSelectedText(rootElement: React.RefObject<HTMLElement>): void {
	// const [selection, setSelection] = useState<ISelection | null>(null);
	const lastSelection = useRef<ISelection | null>(null);
	const dispatch = useDispatch();

	const selectionChangeListener = useCallback(() => {
		/*
		const windowSelection = window.getSelection();

		if (windowSelection?.type === 'None') {
			return;
		}

		const rootNode = rootElement.current;
		if (rootNode && windowSelection?.focusNode?.parentElement) {
			const preventSelectionNode = findNodeByDataType({
				startNode: windowSelection.focusNode.parentElement,
				boundaryNode: rootNode,
				type: SELECTIONBLOCKER,
				depth: 20,
			});

			if (preventSelectionNode) {
				return;
			}
		}

		if (
			(!windowSelection || windowSelection?.isCollapsed) &&
			lastSelection.current !== null
		) {
			dispatch(setSelection(null));
			lastSelection.current = null;
		}
		*/
	}, []);

	const mouseUpListener = useCallback(
		(event: MouseEvent) => {
			const windowSelection = window.getSelection();
			let currentSelection = null;
			const rootNode = rootElement.current;

			if (
				windowSelection?.anchorNode &&
				windowSelection?.focusNode &&
				rootNode
			) {
				const { anchorNode, anchorOffset, focusOffset, focusNode } =
					windowSelection;

				let eventTarget = focusNode;
				if (windowSelection.isCollapsed && event.target) {
					// Somehow mousevent target is way more precise, so when we just click
					// we use the target from this event instead of windowSelection
					eventTarget = event.target as Node;
				}
				let resolvedFocusNode = eventTarget;
				if (
					// If we click on a sentence which is split in multiple parts because
					// it contains word fragments, we would like to set the whole sentence
					// as the focus node
					eventTarget.parentElement?.dataset.type ===
						'filler-fragment' &&
					eventTarget.parentNode
				) {
					resolvedFocusNode = eventTarget.parentNode;
				}
				if (
					anchorNode &&
					resolvedFocusNode?.parentElement &&
					isChild({ parent: rootNode, child: anchorNode }) &&
					isChild({ parent: rootNode, child: resolvedFocusNode })
				) {
					const preventSelectionNode = findNodeByDataType({
						startNode: resolvedFocusNode,
						boundaryNode: rootNode,
						type: SELECTIONBLOCKER,
						depth: 50,
					});
					if (preventSelectionNode) {
						return;
					}
					const range = windowSelection.getRangeAt(0);
					const rangeBounding = range.getBoundingClientRect();
					const rangeFocusBounding =
						resolvedFocusNode.parentElement.getBoundingClientRect();
					const containerBounding = rootNode.getBoundingClientRect();

					const posFocusX =
						rangeFocusBounding.x + rangeFocusBounding.width * 0.5;
					const posFocusY =
						rangeFocusBounding.y + rangeFocusBounding.height;

					const posX = rangeBounding.x + rangeBounding.width * 0.5;
					const posY = rangeBounding.y + rangeBounding.height;

					const relativeFocusX = posFocusX - containerBounding.x;
					const relativeFocusY = posFocusY - containerBounding.y;

					const relativeX = posX - containerBounding.x;
					const relativeY = posY - containerBounding.y;

					const fragmentableBoundary = findNodeByDataType({
						startNode: range.commonAncestorContainer,
						boundaryNode: rootNode,
						type: FRAGMENTABLETYPEID,
					});

					if (
						fragmentableBoundary &&
						fragmentableBoundary.dataset.id
					) {
						const blockBoundary = findNodeByDataType({
							startNode: fragmentableBoundary,
							boundaryNode: rootNode,
							type: BLOCKDATAID,
						});

						if (blockBoundary && blockBoundary.dataset.id) {
							let startOffset;
							let endOffset;
							if (windowSelection.isCollapsed) {
								startOffset = sumUpNodes({
									rootNode: fragmentableBoundary || rootNode,
									targetNode: eventTarget,
									targetNodeOffset: 0,
								});
								endOffset = startOffset + 1;
							} else {
								startOffset = sumUpNodes({
									rootNode: fragmentableBoundary || rootNode,
									targetNode: anchorNode,
									targetNodeOffset: anchorOffset,
								});
								endOffset = sumUpNodes({
									rootNode: fragmentableBoundary || rootNode,
									targetNode: eventTarget,
									targetNodeOffset: focusOffset,
								});
							}
							const res: ISelection = {
								screenPosition: {
									x: relativeX,
									y: relativeY,
									width: rangeBounding.width,
									height: rangeBounding.height,
								},
								focusPosition: {
									x: relativeFocusX,
									y: relativeFocusY,
									width: rangeFocusBounding.width,
									height: rangeFocusBounding.height,
								},
								value: windowSelection.toString(),
								documentSelection: {
									blockId: getUUID(blockBoundary.dataset.id),
									fragmentableId: getUUID(
										fragmentableBoundary.dataset.id
									),
									fragmentableRange: {
										start: Math.min(startOffset, endOffset),
										end: Math.max(endOffset, startOffset),
									},
								},
								collapsed: windowSelection.isCollapsed,
								rootId: rootNode.id,
							};
							currentSelection = res;
						}
					}
				}
			}
			dispatch(setSelection(currentSelection));
			lastSelection.current = currentSelection;
		},
		[rootElement, dispatch]
	);

	useEffect(() => {
		if (rootElement.current) {
			const currentElement = rootElement.current;
			if (!currentElement.id) {
				currentElement.id = getUUID();
			}
			currentElement.addEventListener('mouseup', mouseUpListener);
			document.addEventListener(
				'selectionchange',
				selectionChangeListener
			);
			return () => {
				currentElement.removeEventListener('mouseup', mouseUpListener);
				document.removeEventListener(
					'selectionchange',
					selectionChangeListener
				);
			};
		}
		return undefined;
	}, [mouseUpListener, selectionChangeListener, rootElement]);
}

export default useSelectedText;
export { SELECTIONBLOCKER };
