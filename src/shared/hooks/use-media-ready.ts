import type { RefObject } from 'react';
import { useState, useEffect } from 'react';

type UseMediaReadyProps = {
	mediaRef: RefObject<HTMLMediaElement | null>;
};

export const useMediaReady = ({ mediaRef }: UseMediaReadyProps) => {
	const [isReady, setIsReady] = useState(false);

	useEffect(() => {
		const media = mediaRef.current;

		if (!media) return;

		if (media.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
			setIsReady(true);
			return;
		}

		const handleCanPlay = () => setIsReady(true);

		media.addEventListener('canplay', handleCanPlay);

		return () => {
			media.removeEventListener('canplay', handleCanPlay);
		};
	}, []);

	return isReady;
};
