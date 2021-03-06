import { useState, useEffect } from 'react';

const useDebounce = <T>(value: T, delay: number): T => {
	const [debouncedValue, setDebouncedValue] = useState(value);

	useEffect(() => {
		const handle = setTimeout(() => {
			setDebouncedValue(value);
		}, delay);
		return () => {
			clearTimeout(handle);
		};
	}, [delay, value]);

	return debouncedValue;
};

export default useDebounce;
