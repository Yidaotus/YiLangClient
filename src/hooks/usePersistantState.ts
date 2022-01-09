import React, { useEffect } from 'react';

const usePersistentState = <T>(
	key: string,
	defaultValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] => {
	const [state, setState] = React.useState<T>(() => {
		const localState = localStorage.getItem(key);
		if (localState) {
			return JSON.parse(localState) as T;
		}
		return defaultValue;
	});

	useEffect(() => {
		localStorage.setItem(key, JSON.stringify(state));
	}, [key, state]);

	return [state, setState];
};

export default usePersistentState;
