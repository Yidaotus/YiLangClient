import { ICaretPosition } from '@helpers/DomHelper';
import {
	BlockType,
	ConfigForType,
	DocumentBlock,
	isBlockType,
} from 'Document/Block';
import {
	IDocument,
	IDocumentIdentifier as IFragmentIdentifier,
} from 'Document/Document';
import { Option } from 'Document/Utility';
import {
	IFragmentableString,
	Fragment,
	IFragment,
	IWordFragmentData,
} from 'Document/Fragment';
import { BlockRenderMap } from 'Document/RenderMap';
import { UUID } from 'Document/UUID';
import { ISelection } from '@hooks/useSelectedText';
import { ReactNode } from 'react';
import { Configurator } from '@components/Editor/Blocks/Elements';
import { StoreMap, StoreMutation } from '@store/index';

/*
	NOTE: The extra "T extends any" prevents Typescript from merging our 
	dicriminated union! see : https://github.com/microsoft/TypeScript/issues/30947
*/
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Normalize<T, K extends keyof T, N = void> = T extends any
	? T[K] extends Array<unknown>
		? Omit<T, K> &
				{
					[P in K]: {
						[key: string]: N extends void ? T[K][number] : N;
					};
				}
		: never
	: never;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Normalized<T, K extends keyof T, N = void> = T extends any
	? T[K] extends Array<unknown>
		? Omit<T, K> &
				{
					[P in K]: Array<N>;
				}
		: never
	: never;

export type FragmentableStringNormalized = Normalized<
	IFragmentableString,
	'fragments',
	UUID
>;
export type DocumentBlockNormalized = Normalized<
	DocumentBlock,
	'fragmentables',
	UUID
>;

export type DocumentNormalized = Normalize<
	IDocument,
	'blocks',
	DocumentBlockNormalized
>;

const WORKING_LAYER_NAME = 'Working Layer' as const;
export interface IFragmentLayer {
	id: UUID;
	name: string;
	fragments: StoreMap<Fragment>;
}

export type IEditorState = {
	documentModified: boolean;
	highlightedFragment: IFragmentIdentifier | null;
	highlightedSelection: ISelection | null;
	showSpelling: boolean;
	movedBlock: UUID | null;
	fragmentLayers: Array<IFragmentLayer>;
	selectedFragmentLayer: UUID | null;
	fragmentables: { [key: string]: FragmentableStringNormalized };
	title: 'default';
	document: DocumentNormalized | null;
	selection: ISelection | null;
	storedPosition: {
		caret: ICaretPosition;
		selection: ISelection | null;
	} | null;
};
export type EditorMutations = EditorMutation['type'];
type EditorMutationType<T extends string, P = null> = StoreMutation<
	'EDITOR',
	T,
	P
>;

export type EditorMutation =
	| EditorMutationType<'ADD_BLOCK', { block: DocumentBlockNormalized }>
	| EditorMutationType<'REMOVE_BLOCK', { id: UUID }>
	| EditorMutationType<'PUSH_FRAGMENTS', { fragments: Array<Fragment> }>
	| EditorMutationType<'SET_MOVEDBLOCK', { id: UUID }>
	| EditorMutationType<
			'PUSH_FRAGMENTABLES',
			{ fragmentables: Array<FragmentableStringNormalized> }
	  >
	| EditorMutationType<
			'ADD_FRAGMENT',
			{
				fragmentableId: UUID;
				fragment: Fragment;
			}
	  >
	| EditorMutationType<
			'SET_BLOCKPOSITION',
			{
				id: UUID;
				position: number;
			}
	  >
	| EditorMutationType<
			'REMOVE_FRAGMENT',
			{
				fragmentId: UUID;
			}
	  >
	| EditorMutationType<
			'REMOVE_CHILDFRAGMENT',
			{
				fragmentId: UUID;
				childId: UUID;
			}
	  >
	| EditorMutationType<
			'ADD_WORD_TO_SENTENCE',
			{
				fragmentId: UUID;
				word: IFragment<IWordFragmentData>;
			}
	  >
	| EditorMutationType<
			'REMOVE_WORD_FROM_SENTENCE',
			{
				fragmentId: UUID;
				word: IFragment<IWordFragmentData>;
			}
	  >
	| EditorMutationType<
			'SET_SHOW_SPELLING',
			{
				show: boolean;
			}
	  >
	| EditorMutationType<
			'UPDATE_FRAGMENT',
			{
				fragment: Fragment;
			}
	  >
	| EditorMutationType<
			'SET_HIGHLIGHTED_SELECTION',
			{
				selection: ISelection | null;
			}
	  >
	| EditorMutationType<'TOGGLE_SPELLING'>
	| EditorMutationType<
			'SET_HIGHLIGHTED_FRAGMENT',
			{
				fragmentIdentifier: IFragmentIdentifier | null;
			}
	  >
	| EditorMutationType<
			'CONFIGURE_BLOCK',
			{
				configurator: Configurator;
				blockId: UUID;
			}
	  >
	| EditorMutationType<
			'SET_RENDERMAP',
			{
				renderMap: BlockRenderMap;
			}
	  >
	| EditorMutationType<'RESET'>
	| EditorMutationType<
			'SET_STATE',
			{
				editorState: IEditorState;
			}
	  >
	| EditorMutationType<'SET_SELECTION', { selection: ISelection | null }>
	| EditorMutationType<'SET_ACTIVE_LAYER', { id: UUID }>
	| EditorMutationType<'ADD_LAYER', { layer: IFragmentLayer }>
	| EditorMutationType<'SET_DOCUMENT_MODIFIED', { modified: boolean }>
	| EditorMutationType<
			'SET_STORED_POSITION',
			{
				position: {
					caret: ICaretPosition;
					selection: ISelection | null;
				};
			}
	  >;

export type ConfigurableDocumentBlockNormalized<T> = DocumentBlockNormalized & {
	config: T;
};

const isConfigurableBlockNormalized = (
	block: DocumentBlockNormalized
): block is ConfigurableDocumentBlockNormalized<unknown> => {
	return (
		(block as ConfigurableDocumentBlockNormalized<unknown>).config !==
		undefined
	);
};

const isNormalizedBlockType =
	<T extends DocumentBlockNormalized['type']>(type: T) =>
	(
		block: DocumentBlockNormalized
	): block is Extract<DocumentBlockNormalized, { type: T }> => {
		return block.type === type;
	};

export type BlockConfigurator<
	T extends BlockType,
	V extends keyof ConfigForType<T>
> = {
	blockType: T;
	icon: ReactNode;
	title: string;
	parameter: V;
	value:
		| ConfigForType<T>[V]
		| ((config: ConfigForType<T>) => ConfigForType<T>[V]);
};

const createBlockConfigurator = <
	T extends BlockType,
	V extends keyof ConfigForType<T>
>(
	config: BlockConfigurator<T, V>
): BlockConfigurator<T, V> => config;

/**
 * We need an array of all possible parings of BlockType and ConfigParameter
 * for example : BlockConfigurator<Title, alignment> | BlockConfigurator<Title, size>
 *
 * without the conditional we would not create a new union but set the property to the keyof type
 */
export type BlockConfigUnionWrong<T extends BlockType> = BlockConfigurator<
	T,
	keyof ConfigForType<T>
>;

/*
const isConfigForType = <
	B extends BlockType,
	T extends ConfigurableDocumentBlockNormalized<ConfigForType<B>>,
	V extends Extract<
		BlockConfigUnion<
			T['type'],
			keyof ConfigForType<T['type']>,
			{ parameter: P }
		>
	>,
	P extends V['parameter']
>(
	blockType: B,
	block: T,
	config: V,
	param: P
): config is Extract<V, { parameter: P }> => {
	return (config as any).blockType === blockType;
};

*/
export type BlockConfigUnion<
	T extends BlockType,
	V extends keyof ConfigForType<T>
> = V extends keyof ConfigForType<T> ? BlockConfigurator<T, V> : never;

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

export {
	isConfigurableBlockNormalized,
	isNormalizedBlockType,
	createBlockConfigurator,
	createBlockDefinition,
	WORKING_LAYER_NAME,
};
