const findTagElement = ({
	startNode,
	boundaryNode,
	tag,
	maxDepth,
}: {
	startNode: Node;
	boundaryNode?: Node;
	tag: string;
	maxDepth?: number;
}): Node | null => {
	let anchor: Node | null = startNode;
	let parentAnchor = null;
	let depth = maxDepth || 10;
	while (anchor && !boundaryNode?.isSameNode(anchor) && depth > 0) {
		if ((anchor as Element).tagName === tag) {
			parentAnchor = anchor;
			break;
		}
		anchor = anchor.parentElement;
		depth--;
	}

	return parentAnchor;
};

const mergeAdjecentRanges = ({
	sourceRange,
	destRange,
}: {
	sourceRange: Range;
	destRange: Range;
}): void => {
	/**
	 *  -1, 0, or 1, indicating whether the corresponding boundary-point of the Range is
	 * respectively before, equal to, or after the corresponding boundary-point of sourceRange.
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/Range/compareBoundaryPoints
	 */
	const compare = sourceRange.compareBoundaryPoints(
		Range.START_TO_START,
		destRange
	);
	if (compare > 0)
		sourceRange.setStart(destRange.startContainer, destRange.startOffset);
	else sourceRange.setEnd(destRange.endContainer, destRange.endOffset);
};

const unwrapNode = (node: Element): void => {
	const trange = new Range();
	trange.selectNodeContents(node);
	const content = trange.extractContents();
	node.remove();
	trange.insertNode(content);
};

const surroundNode = ({
	sel,
	root,
	tag,
}: {
	sel: Selection;
	root?: HTMLElement;
	tag: string;
}): void => {
	const { anchorNode, focusNode } = sel;
	if (anchorNode && focusNode) {
		const mark = document.createElement(tag);
		const range = sel.getRangeAt(0);

		[focusNode.parentElement, anchorNode.parentElement].forEach((el) => {
			if (el) {
				const tagNode = findTagElement({
					tag,
					startNode: el,
				});
				if (tagNode) {
					const exRange = new Range();
					exRange.selectNode(tagNode);
					mergeAdjecentRanges({
						sourceRange: range,
						destRange: exRange,
					});
				}
			}
		});

		const selectedText = range.extractContents();
		selectedText.querySelectorAll(tag).forEach((t) => {
			unwrapNode(t);
		});
		mark.appendChild(selectedText);
		range.insertNode(mark);

		// Normalize Text nodes
		root?.normalize();
	}
};

const getTextNodeAtPosition = ({
	root,
	index,
}: {
	root: Node;
	index: number;
}): { node: Node; position: number } | null => {
	const NODE_TYPE = NodeFilter.SHOW_TEXT;
	let counter = index;
	const treeWalker = document.createTreeWalker(root, NODE_TYPE, {
		acceptNode: (elem: HTMLElement) => {
			const contentLength = elem.textContent?.length || 0;
			if (counter > contentLength) {
				counter -= contentLength;
				return NodeFilter.FILTER_REJECT;
			}
			return NodeFilter.FILTER_ACCEPT;
		},
	});
	const c = treeWalker.nextNode();
	return (
		c && {
			node: c,
			position: counter,
		}
	);
};

export interface ICaretPosition {
	context: string;
	startOffset: number;
	endOffset: number;
}

const restoreCaretPosition = ({
	caretPosition,
	offset,
}: {
	caretPosition: ICaretPosition;
	offset?: number;
}): void => {
	// TODO: Need for a cleaner solutaion. Rerender and CaretRestore are very racy
	setTimeout(() => {
		const selection = window.getSelection();

		if (!selection) {
			return;
		}

		const selectionOffset = offset || 0;
		const { context, startOffset, endOffset } = caretPosition;

		const contextNode = document.querySelector(`[data-id='${context}']`);

		if (contextNode) {
			const startPos = getTextNodeAtPosition({
				root: contextNode,
				index: startOffset + selectionOffset + 1,
			});
			const endPos = getTextNodeAtPosition({
				root: contextNode,
				index: endOffset + selectionOffset,
			});
			if (startPos && endPos) {
				selection.removeAllRanges();
				const newRange = new Range();
				newRange.setStart(startPos.node, startPos.position - 1);
				newRange.setEnd(endPos.node, endPos.position);
				selection.addRange(newRange);
			}
		}
	}, 100);
};

const saveCaretPosition = (
	context: Element | string
): ICaretPosition | null => {
	let boundaryNode;
	if (typeof context === 'string') {
		boundaryNode = document.querySelector(`[data-id="${context}"]`);
	} else {
		boundaryNode = context;
	}

	if (!boundaryNode) {
		return null;
	}

	const selection = window.getSelection();
	if (!selection || selection.rangeCount < 1) {
		return null;
	}
	const range = selection.getRangeAt(0);

	const startRange = range.cloneRange();
	const rangeLength = startRange.toString().length;
	startRange.setStart(boundaryNode, 0);

	const startOffset = startRange.toString().length - rangeLength;
	const endOffset = startOffset + rangeLength;

	// TODO
	const boundaryNodeId = '';
	(boundaryNode as HTMLElement).dataset.id = boundaryNodeId;
	return {
		context: boundaryNodeId,
		startOffset,
		endOffset,
	};
};

const findNodeByDataType = ({
	startNode,
	type,
	boundaryNode,
	depth = 10,
}: {
	startNode: Node;
	type: string;
	boundaryNode?: Node;
	depth?: number;
}): HTMLElement | null => {
	let anchor: Node | null = startNode;
	let parentAnchor = null;
	let depthLimit = depth;
	while (anchor && !boundaryNode?.isSameNode(anchor) && depthLimit > 0) {
		if ((anchor as HTMLElement).dataset?.type === type) {
			parentAnchor = anchor;
			break;
		}
		anchor = anchor.parentElement;
		depthLimit--;
	}

	return parentAnchor as HTMLElement;
};

/**
 * Sum up all text from rootNode until targetNode including the targetNode offset
 */
const sumUpNodes = ({
	rootNode,
	targetNode,
	targetNodeOffset,
}: {
	rootNode: Node;
	targetNode: Node;
	targetNodeOffset: number;
}): number => {
	/* 
	let offset = nodeOffset;
	let currentNode: Node | null = node;

	while (currentNode && !currentNode.isSameNode(rootNode)) {
		if (currentNode.previousSibling) {
			const text = currentNode.previousSibling.textContent;
			if (text) {
				offset += text.length;
			}
			currentNode = currentNode.previousSibling;
		} else {
			currentNode = currentNode.parentElement;
		}
	} */

	// ^ lol >
	const range = new Range();
	range.selectNodeContents(rootNode);
	range.setEnd(targetNode, targetNodeOffset);

	return range.toString().length;
};

const isChild = ({ parent, child }: { parent: Node; child: Node }): boolean => {
	let current = child;
	while (current.parentElement) {
		if (parent.isSameNode(current.parentElement)) {
			return true;
		}
		current = current.parentElement;
	}

	return false;
};

const scrollIdIntoView = (id: string): void => {
	const node = document.querySelector(`[data-id='${id}']`);
	if (node) {
		node.scrollIntoView({ behavior: 'smooth', block: 'center' });
		// TODO: Dirty hack to reposition the popovers
		window.dispatchEvent(new Event('resize'));
	}
};

export {
	isChild,
	sumUpNodes,
	findNodeByDataType,
	findTagElement,
	getTextNodeAtPosition,
	mergeAdjecentRanges,
	saveCaretPosition,
	surroundNode,
	unwrapNode,
	restoreCaretPosition,
	scrollIdIntoView,
};
