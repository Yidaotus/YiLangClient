import { findTagElement, unwrapNode, surroundNode } from './DomHelper';

interface IRichTextTool {
	name: string;
	tooltip: string;

	tag: string;
	class?: string;
	dataAttributes?: Map<string, string>;

	checkActive: () => boolean;
	wrap: () => void;
	/* 
	unwrap: (sel: Selection, block: HTMLElement) => boolean;
	*/
}

interface IToolOptions {
	tag: string;
	name: string;
	tooltip: string;
}

const RichTextTool = ({ tag, name, tooltip }: IToolOptions): IRichTextTool => {
	const checkActive = (): boolean => {
		const sel = window.getSelection();
		if (sel?.anchorNode && sel.focusNode) {
			const anchorFind = findTagElement({
				startNode: sel.anchorNode,
				tag,
			});
			const focusFind = findTagElement({
				startNode: sel.focusNode,
				tag,
			});
			return !!anchorFind || !!focusFind;
		}
		return false;
	};

	const wrap = (): void => {
		const sel = window.getSelection();
		// const restore = SelectionHelper.saveCaretPosition(block);
		if (sel?.anchorNode && sel.focusNode) {
			const anchorFind = findTagElement({
				startNode: sel.anchorNode,
				tag,
			});
			const focusFind = findTagElement({
				startNode: sel.focusNode,
				tag,
			});
			// Only unwrap if selection is inside of tag
			if (anchorFind && focusFind) {
				// <b>jidwoaj</b>djiwo<b>da2</b>
				unwrapNode(anchorFind as Element);
			} else {
				surroundNode({
					sel,
					tag,
				});
			}
		}
		// if (restore) restore(0);
	};

	return {
		tag,
		name,
		tooltip,
		checkActive,
		wrap,
	};
};

export default RichTextTool;
