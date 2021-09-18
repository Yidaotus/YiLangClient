import React from 'react';
import { Button, Input, Form } from 'antd';
import { ISentence } from 'Document/Dictionary';

interface ISentenceEditorProps {
	root: string;
	addSentenceCallback(sentence: ISentence): void;
}

const SentenceEditor: React.FC<ISentenceEditorProps> = (
	props: ISentenceEditorProps
) => {
	const { root, addSentenceCallback } = props;
	return (
		<Form
			name="basic"
			onFinish={(values) => {
				addSentenceCallback({
					content: root,
					translation: values.translation,
				});
			}}
		>
			<Form.Item
				label="Translation"
				name="translation"
				rules={[
					{
						required: true,
						message: 'Please add a translation!',
					},
				]}
			>
				<Input />
			</Form.Item>
			<Button type="primary" htmlType="submit">
				Save Sentence
			</Button>
		</Form>
	);
};

export default SentenceEditor;
