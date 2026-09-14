import { useEffect, useRef, useState } from 'react';

export const useInView = (
	threshold = 0.1,
	rootMargin = '0px',
	triggerOnce = false
) => {
	const ref = useRef<HTMLElement>(null);
	const [isInView, setIsInView] = useState(false);
	const [intersectionRatio, setIntersectionRatio] = useState(0);
	const [isNearEnd, setIsNearEnd] = useState(false);

	useEffect(() => {
		const element = ref.current;
		if (!element || (triggerOnce && isInView)) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				const isIntersecting = entry.isIntersecting;
				const ratio = entry.intersectionRatio;

				setIsInView(isIntersecting);
				setIntersectionRatio(ratio);

				const rect = entry.boundingClientRect;
				const visibleFromBottom = Math.max(0, rect.bottom) / rect.height;
				const isSectionNearEnd =
					isIntersecting && (ratio > 0.6 || visibleFromBottom < 0.3);

				setIsNearEnd(isSectionNearEnd);
			},
			{
				threshold,
				rootMargin,
			}
		);

		observer.observe(element);

		return () => observer.disconnect();
	}, [threshold, rootMargin, triggerOnce, isInView]);

	return { ref, isInView, intersectionRatio, isNearEnd };
};
