import React, { useState } from 'react';

import { Select, Input, Space, Button, Alert } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { BlockType, DocumentBlock } from 'Document/Block';
import { parseBlock } from 'store/editor/actions';
import { blockTypes } from '../Blocks/Elements';

const { Option } = Select;
const { TextArea } = Input;
export interface IAddBlockPanelProps {
	addBlockCB: (block: DocumentBlock) => void;
}

const AddBlockPanel: React.FC<IAddBlockPanelProps> = ({ addBlockCB }) => {
	const defaultBlockType: BlockType = 'Paragraph';
	const [blockType, setBlockType] = useState<BlockType>(defaultBlockType);
	const [blockContent, setBlockContent] = useState('');
	const [errorMsg, setErrorMsg] = useState<Error | null>(null);

	const addBlock = () => {
		try {
			const block = parseBlock({
				type: blockType,
				content: blockContent,
				position: 1,
			});
			if (block) {
				addBlockCB(block);
				setBlockType(defaultBlockType);
				setBlockContent('');
				setErrorMsg(null);
			}
		} catch (e) {
			const error: Error = e;
			setErrorMsg(error);
		}
	};

	return (
		<div>
			<Space direction="vertical" style={{ width: '100%' }}>
				{errorMsg && (
					<Alert
						type="error"
						message={errorMsg.name}
						description={errorMsg.message}
						onClose={() => setErrorMsg(null)}
						closable
					/>
				)}
				<Select
					defaultValue="Paragraph"
					style={{ width: '100%' }}
					onChange={(value) => setBlockType(value)}
					value={blockType}
				>
					{blockTypes.map((type) => (
						<Option key={type} value={type}>
							{type}
						</Option>
					))}
				</Select>
				<TextArea
					rows={4}
					onChange={(value) => setBlockContent(value.target.value)}
					value={blockContent}
				/>
				<Button
					icon={<PlusOutlined />}
					style={{ width: '100%' }}
					onClick={addBlock}
					disabled={blockContent.length < 1}
				>
					Create new Block
				</Button>
			</Space>
		</div>
	);
};

export default AddBlockPanel;
