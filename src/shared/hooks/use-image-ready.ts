import { useEffect, useState, type RefObject } from 'react';

type UseImageReadyProps = {
	imageRef: RefObject<HTMLImageElement | null>;
};

export const useImageReady = ({ imageRef }: UseImageReadyProps) => {
	const [isReady, setIsReady] = useState(false);

	useEffect(() => {
		const image = imageRef.current;

		if (!image) return;

		if (image.complete) {
			setIsReady(true);
			return;
		}

		const handleLoad = () => setIsReady(true);

		image.addEventListener('load', handleLoad);

		return () => {
			image.removeEventListener('load', handleLoad);
		};
	}, []);

	return isReady;
};
