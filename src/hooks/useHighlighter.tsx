import React, { createElement } from 'react';

export type RangeTuple = [number, number];

interface IHighlighterProps {
	input: string;
	indices: ReadonlyArray<RangeTuple>;
	tagName: string;
	formatter?: (i: string) => JSX.Element;
}

const Highlighter: React.FC<IHighlighterProps> = ({
	input,
	indices,
	tagName,
	formatter,
}: IHighlighterProps): JSX.Element => {
	const chunks = [];
	let pos = 0;
	for (const i of indices) {
		const chunkBefore = input.substring(pos, i[0]);
		const chunkHighlight = input.substring(i[0], i[1] + 1);

		const spanBefore = formatter ? formatter(chunkBefore) : chunkBefore;
		const spanHighlight = formatter
			? formatter(chunkHighlight)
			: chunkHighlight;

		chunks.push(
			createElement('span', {}, [spanBefore]),
			createElement(tagName, {}, spanHighlight)
		);
		pos += i[1] + 1 - i[0] + (i[0] - pos);
	}
	if (pos < input.length) {
		chunks.push(
			createElement('span', {}, [
				formatter
					? formatter(input.substring(pos, input.length))
					: input.substring(pos, input.length),
			])
		);
	}
	if (pos === 0) {
		chunks.push(createElement('span', {}, [input]));
	}
	return <span>{chunks}</span>;
};

export default Highlighter;
