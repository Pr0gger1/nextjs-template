import clsx from 'clsx';
import type { ReactNode } from 'react';

import css from './index.module.css';

type TooltipProps = {
	children: ReactNode;
	className: string;
	text: string;
};

export const Tooltip = ({ ...props }: TooltipProps) => {
	return (
		<div className={clsx(css.wrapper, props.className)}>
			{props.children}
			<dialog className={css.dialog}>{props.text}</dialog>
		</div>
	);
};
