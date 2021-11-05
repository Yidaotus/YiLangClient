import React from 'react';
import { Button, Input, Form } from 'antd';
import { IDictionarySentence } from 'Document/Dictionary';

interface ISentenceEditorProps {
	root: string;
	addSentenceCallback(sentence: IDictionarySentence): void;
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
					// @TODO
					id: 'lul',
					lang: 'lul2',
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
