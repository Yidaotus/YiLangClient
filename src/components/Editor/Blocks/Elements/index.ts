import { BlockType, DocumentBlock } from 'Document/Block';
import { BlockRenderFunction } from '@store/editor/types';
import Dialog from './Dialog/Dialog';
import Image from './Image/Image';
import Title from './Title/Title';
import Paragraph from './Paragraph/Paragraph';
import List from './List/List';

const BlockElements = [Title, Dialog, Image, Paragraph, List];

export type Configurator =
	typeof BlockElements[number]['configurators'][number];

type IConfiguratorMap = {
	[key in BlockType]?: Array<Configurator>;
};
const configuratorMap: IConfiguratorMap =
	BlockElements.reduce<IConfiguratorMap>((acc, elem) => {
		acc[elem.type] = elem.configurators;
		return acc;
	}, {} as IConfiguratorMap);

type BlockRenderMap = {
	[key in BlockType]?: BlockRenderFunction;
};

const blockRenderers: BlockRenderMap = BlockElements.reduce((acc, element) => {
	acc[element.type] = element.render;
	return acc;
}, {} as BlockRenderMap);

const blockTypes = BlockElements.reduce((acc, element) => {
	acc.push(element.type);
	return acc;
}, new Array<string>());

type BlockParserMap = {
	[key in BlockType]?: (content: string, position: number) => DocumentBlock;
};

const blockParsers: BlockParserMap = BlockElements.reduce((acc, element) => {
	acc[element.type] = element.parse;
	return acc;
}, {} as BlockParserMap);

export {
	configuratorMap,
	BlockElements,
	blockRenderers,
	blockTypes,
	blockParsers,
};
