import React, { useEffect, useRef, useState } from 'react';
import { Input } from 'antd';
import { EnterOutlined } from '@ant-design/icons';

import './SimpleInput.css';

const { Search } = Input;

export interface ISimpleInputState {
	callback: (input: string | null) => void;
	placeholder: string;
}

interface IUseInputReturn {
	simpleInputState: ISimpleInputState;
	getUserInput: (placeholder?: string) => Promise<string | null>;
}

const defaultInputstate: ISimpleInputState = {
	callback: () => {},
	placeholder: '',
};

const useSimpleInput = (): IUseInputReturn => {
	const [inputState, setInputState] =
		useState<ISimpleInputState>(defaultInputstate);

	const getUserInput = (placeholder?: string): Promise<string | null> => {
		return new Promise((resolve) => {
			setInputState({
				callback: (input: string | null) => {
					resolve(input);
					setInputState(defaultInputstate);
				},
				placeholder: placeholder || '',
			});
		});
	};

	return { simpleInputState: inputState, getUserInput };
};

const SimpleInput: React.FC<ISimpleInputState> = ({
	callback,
	placeholder,
}) => {
	const [inputValue, setInputValue] = useState('');
	const inputRef = useRef<Input>(null);

	useEffect(() => {
		inputRef.current?.focus();
	}, [inputRef]);

	return (
		<div className="simple-input-container">
			<Search
				ref={inputRef}
				className="simple-input-tool"
				enterButton={<EnterOutlined />}
				placeholder={placeholder}
				value={inputValue}
				onChange={(e) => setInputValue(e.target.value)}
				onSearch={() => {
					setInputValue('');
					callback(inputValue);
				}}
				onKeyDown={(key) => {
					if (key.key === 'Escape') {
						setInputValue('');
						callback(null);
					}
				}}
			/>
		</div>
	);
};

export default SimpleInput;
export { useSimpleInput };
