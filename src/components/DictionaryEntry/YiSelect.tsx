import React from 'react';
import Select, { SelectProps } from 'antd/lib/select';

export interface YiSelectProps extends SelectProps<string[]> {
	value?: string[];
	onChange?: (value: string[]) => void;
}

const YiSelect: React.FC<YiSelectProps> = (props: YiSelectProps) => {
	/*
	const { value } = props;
	const [sanitizedValues, setSanitizedValues] = useState<string[]>(
		value || []
	);

	useEffect(() => {
		setSanitizedValues(value || []);
	}, [setSanitizedValues, value]);

	/*
	const changeEvent = (options: string[]) => {
		const sanitizedInput = new Set<string>();
		options.forEach((opt) => {
			opt.split(/[;,]/).forEach((optSpl) =>
				sanitizedInput.add(optSpl.trim())
			);
		});
		props.onChange?.([...sanitizedInput]);
		setSanitizedValues([...sanitizedInput]);
	};
	*/

	return <Select {...props} open={false} tokenSeparators={[',', ';']} />;
};

export default YiSelect;
