declare module 'ahocorasick' {
	export default class AhoCorasick {
		constructor(initial?: Array<string>): AhoCorasick;

		search(searchString: string): Array<[number, Array<string>]>;
	}
}
