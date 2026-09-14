import cx from 'clsx';
import type { ComponentProps } from 'react';

import css from './index.module.css';

type ChipVariant = 'primary';

type ChipCustomProps = {
	color?: ChipVariant;
};

type ChipProps = ComponentProps<'input'> & ChipCustomProps;

const colors = {
	primary: css.primary,
};

export const Chip = ({
	className,
	children,
	type = 'checkbox',
	color = 'primary',
	...props
}: ChipProps) => {
	const classNames = cx(css.root, className, {
		[colors[color]]: color,
	});

	return (
		<label className={css.label}>
			<input className={cx(css.input)} type={type} {...props} />
			<div className={cx(css.root, classNames)}>{children}</div>
		</label>
	);
};
