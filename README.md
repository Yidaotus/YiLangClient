<p align="center">
  <img src="https://raw.githubusercontent.com/Yidaotus/YiLang_Client/main/public/yilang-green.png" />
</p>

## Basics

YiLang helps you study new languages by providing a variety of tools for learning a variety of different content.

<img src="https://i.imgur.com/fvEOgfK.png" />

## Tools

The main tool of YiLang is the Content Editor which lets you insert a variety of `Blocks`. A `Block` can have a number of so called `FragmentableStrings`. Each `FragmentableString` is composed of `RenderableFragments` which represent sentences, words, marks etc.

You can add new `Fragments` like words and sentences, nest words in sentences, find out what vocabulary you already studied, lookup vocabulary, show spelling hints and mark components for later.

Each studied content is saved and grouped by language. Each language can have a variety of `LanguageSettings` like: `LookupSources`: Template URLs for external dictionary services

## Contributions

Contributions are always welcomed. Please follow a few guidelines if you want to do so:

-   Tabs instead of spaces
-   Honor the eslint settings

### Extensability

YiLang is build to be as extensable as possible. Tools and Blocks can be added quickly without much code.
Blocks are created wiith the `createBlockDefinition` helper which checks typings. As seen by the following type definition:

```ts
export type BlockRenderFunction = (block: DocumentBlock) => Option<JSX.Element>;

export interface IBlockDefinition<T extends BlockType, P> {
	type: T;
	block: React.FC<P>;
	configurators: Array<BlockConfigUnion<T, keyof ConfigForType<T>>>;
	render: (block: Extract<DocumentBlock, { type: T }>) => JSX.Element;
	parse: (
		content: string,
		position: number
	) => Extract<DocumentBlock, { type: T }>;
}

export type IGuardedBlockDefinition<T extends BlockType, P> = Omit<
	IBlockDefinition<T, P>,
	'render'
> & {
	render: BlockRenderFunction;
};

const createBlockDefinition = <T extends BlockType, P>(
	definition: IBlockDefinition<T, P>
): IGuardedBlockDefinition<T, P> => ({
	...definition,
	render: (block: DocumentBlock) =>
		isBlockType(definition.type)(block) ? definition.render(block) : null,
});
```
