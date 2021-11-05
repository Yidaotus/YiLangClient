import { useCallback, useRef } from 'react';

const useDebouncedCallback = (func: (...args: any[]) => void, wait: number) => {
	// Use a ref to store the timeout between renders
	// and prevent changes to it from causing re-renders
	const timeout = useRef<ReturnType<typeof setTimeout>>();

	return useCallback(
		(...args) => {
			const later = () => {
				if (timeout.current) {
					clearTimeout(timeout.current);
				}
				func(...args);
			};

			if (timeout.current) {
				clearTimeout(timeout.current);
			}
			timeout.current = setTimeout(later, wait);
		},
		[func, wait]
	);
};

export default useDebouncedCallback;
