import cx from 'clsx';
import { type ComponentProps } from 'react';

import { Chip } from '../chip';
import css from './index.module.css';

export type ChipOption = {
	value: string;
	label: string;
};

type ChipGroupCustomProps = {
	options: Array<ChipOption>;
	chipProps: ComponentProps<typeof Chip>;
};

type ChipGroupProps = ComponentProps<'ul'> & ChipGroupCustomProps;

export const ChipGroup = ({
	options,
	chipProps,
	className,
	...props
}: ChipGroupProps) => {
	return (
		<ul role="radiogroup" className={cx(css.root, className)} {...props}>
			{options.map(option => (
				<li key={option.value}>
					<Chip value={option.value} {...chipProps}>
						{option.label}
					</Chip>
				</li>
			))}
		</ul>
	);
};
