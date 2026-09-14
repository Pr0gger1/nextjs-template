import clsx from 'clsx';
import Link from 'next/link';
import type { ComponentProps } from 'react';

type ActionButtonProps = ComponentProps<'button'> | ComponentProps<typeof Link>;

export const Action = ({ ...props }: ActionButtonProps) => {
	const classNames = clsx(props.className);

	return 'href' in props ? (
		<Link {...props} className={classNames}>
			{props.children}
		</Link>
	) : (
		<button {...props} type={props.type ?? 'button'} className={classNames}>
			{props.children}
		</button>
	);
};
