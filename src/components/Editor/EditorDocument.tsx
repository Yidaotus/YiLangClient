import './EditorDocument.css';
import React, { useCallback } from 'react';
import { Transforms, Range } from 'slate';
import {
	Editable,
	RenderLeafProps,
	RenderElementProps,
	useSlateStatic,
} from 'slate-react';
import MarkFragment from './Fragments/Mark/MarkFragment';
import SentenceFragment from './Fragments/Sentence/SentenceFragment';
import WordFragment from './Fragments/Word/WordFragment';
import ImageBlock from './Blocks/Image/Image';
import WordList from './Blocks/WordList/WordList';
import VideoBlock, { videoBlockPasteAction } from './Blocks/Video/Video';

const Leaf = ({ attributes, leaf, children }: RenderLeafProps) => {
	return (
		<span
			{...attributes}
			style={{
				fontWeight: leaf.bold ? 'bold' : 'normal',
				color: leaf.color,
			}}
		>
			{children}
		</span>
	);
};

const Element = (props: RenderElementProps) => {
	const { children, attributes, element } = props;
	switch (element.type) {
		case 'sentence':
			return (
				<SentenceFragment attributes={attributes} element={element}>
					{children}
				</SentenceFragment>
			);
		case 'title': {
			return (
				<h1
					{...attributes}
					style={{ textAlign: element.align || 'left' }}
				>
					{children}
				</h1>
			);
		}
		case 'subtitle': {
			return (
				<h2
					{...attributes}
					style={{ textAlign: element.align || 'left' }}
				>
					{children}
				</h2>
			);
		}
		case 'highlight':
			return element.role === 'highlight' ? (
				<span
					style={{ color: 'black' }}
					{...attributes}
					contentEditable={false}
				>
					{children}
				</span>
			) : (
				<span
					style={{ color: 'lightgray' }}
					{...attributes}
					contentEditable={false}
				>
					{children}
				</span>
			);
		case 'image':
			return (
				<ImageBlock attributes={attributes} element={element}>
					{children}
				</ImageBlock>
			);
		case 'word':
			return (
				<WordFragment
					attributes={attributes}
					element={element}
					// eslint-disable-next-line react/no-children-prop
					children={children}
				/>
			);
		case 'mark':
			return (
				<MarkFragment attributes={attributes} element={element}>
					{children}
				</MarkFragment>
			);
		case 'dialog':
			return (
				<div className="dialog-container" {...attributes}>
					{children}
				</div>
			);
		case 'dialogLine':
			return (
				<div className="dialog-line" {...attributes}>
					{children}
				</div>
			);
		case 'dialogLineActor':
			return (
				<div
					className="dialog-line-actor .bp3-text-overflow-ellipsis"
					{...attributes}
				>
					{children}
				</div>
			);
		case 'dialogLineSpeech':
			return (
				<div className="dialog-line-speech" {...attributes}>
					{children}
				</div>
			);
		case 'listItem':
			return <li {...attributes}>{children}</li>;
		case 'numberedList':
			return <ol {...attributes}>{children}</ol>;
		case 'bulletedList':
			return <ul {...attributes}>{children}</ul>;
		case 'wordList':
			return (
				<WordList attributes={attributes} element={element}>
					{children}
				</WordList>
			);
		case 'blockQuote':
			return (
				<blockquote
					{...attributes}
					style={{ textAlign: element.align || 'left' }}
				>
					{children}
				</blockquote>
			);
		case 'video':
			return (
				<VideoBlock attributes={attributes} element={element}>
					{children}
				</VideoBlock>
			);
		default:
			return (
				<div
					{...attributes}
					style={{ textAlign: element.align || 'left' }}
				>
					{children}
				</div>
			);
	}
};

const EditorDocument: React.FC = () => {
	const renderLeaf = useCallback((props) => {
		return <Leaf {...props} />;
	}, []);
	const renderElement = useCallback((props) => <Element {...props} />, []);
	const editor = useSlateStatic();

	return (
		<div style={{ position: 'relative', fontSize: '1.3em' }}>
			<Editable
				onPaste={(event) => {
					videoBlockPasteAction(event, editor);
				}}
				className="editor-container"
				renderElement={renderElement}
				renderLeaf={renderLeaf}
				onMouseDown={() => {
					if (
						editor.selection &&
						!Range.isCollapsed(editor.selection)
					) {
						if (
							editor.operations[editor.operations.length - 1]
								?.type !== 'set_selection'
						) {
							Transforms.collapse(editor);
						}
					}
				}}
			/>
		</div>
	);
};

export default EditorDocument;
