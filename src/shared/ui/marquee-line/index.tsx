import cx from 'clsx';
import type { ReactNode } from 'react';
import { useRef } from 'react';

import css from './index.module.css';

type MarqueeLineProps = {
	children: ReactNode;
	speed: number;
	className?: string;
	reverse?: boolean;
};

export const MarqueeLine = ({
	children,
	speed,
	className,
	reverse,
}: MarqueeLineProps) => {
	const lineRef = useRef<HTMLDivElement>(null);

	const animationParams = {
		leftPart: {
			animationDuration: `${speed}s`,
			animationDelay: `-${speed}s`,
			animationDirection: reverse ? 'reverse' : 'normal',
		},
		rightPart: {
			animationDuration: `${speed}s`,
			animationDelay: `-${speed / 2}s`,
			animationDirection: reverse ? 'reverse' : 'normal',
		},
	};

	return (
		<div className={cx(css.root, className)} ref={lineRef}>
			<div className={css.leftPart} style={animationParams.leftPart}>
				{children}
			</div>
			<div className={css.rightPart} style={animationParams.rightPart}>
				{children}
			</div>
		</div>
	);
};
