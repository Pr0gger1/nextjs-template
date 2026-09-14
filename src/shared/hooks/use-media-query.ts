import { useCallback, useSyncExternalStore } from 'react';

export function useMediaQuery(query: string) {
	const subscribe = useCallback(
		(callback: VoidFunction) => {
			const matchMedia = window.matchMedia(query);
			matchMedia.addEventListener('change', callback);
			return () => {
				matchMedia.removeEventListener('change', callback);
			};
		},
		[query]
	);

	const getSnapshot = () => {
		return window.matchMedia(query).matches;
	};

	const getServerSnapshot = () => {
		return null;
	};

	return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
