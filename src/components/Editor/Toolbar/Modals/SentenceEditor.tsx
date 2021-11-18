import React, { useState } from 'react';
import { IDictionarySentence } from 'Document/Dictionary';
import { Button, InputGroup } from '@blueprintjs/core';

interface ISentenceEditorProps {
	root: string;
	addSentenceCallback(sentence: IDictionarySentence): void;
}

const SentenceEditor: React.FC<ISentenceEditorProps> = (
	props: ISentenceEditorProps
) => {
	const [translation, setTranslation] = useState('');
	const { root, addSentenceCallback } = props;
	return (
		<form
			name="basic"
			onSubmit={() => {
				addSentenceCallback({
					// @TODO
					id: 'lul',
					lang: 'lul2',
					content: root,
					translation,
				});
			}}
		>
			<InputGroup
				value={translation}
				onChange={(e) => setTranslation(e.target.value)}
			/>
			<Button type="submit">Save Sentence</Button>
		</form>
	);
};

export default SentenceEditor;
