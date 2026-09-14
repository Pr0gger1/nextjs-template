import clsx from 'clsx';
import type { ComponentProps, FC } from 'react';

import css from './index.module.css';
import { Source } from './source';

import { MEDIA_QUERIES } from '@/shared/config/media-query';
import type { ImageProps } from '@/shared/types/picture.types';

export type PosterImageProps = {
	alt?: string;
	original: ImageProps;
	webp?: ImageProps;
};

type PictureProps = {
	poster: PosterImageProps;
	className?: string;
	imageProps?: ComponentProps<'img'>;
};

export const Picture: FC<PictureProps> = ({
	poster,
	className,
	imageProps,
	...props
}) => {
	if (!poster) return null;

	const fallbackSrc =
		poster?.original?.desktop?.x1 ||
		poster?.original?.desktop?.x2 ||
		poster?.original?.mobile?.x1 ||
		poster?.original?.mobile?.x2 ||
		poster?.original?.tablet?.x1 ||
		poster?.original?.tablet?.x2;

	return (
		<picture className={clsx(css.root, className)} {...props}>
			{poster?.webp?.mobile && (
				<Source
					source={poster?.webp?.mobile}
					mediaQuery={MEDIA_QUERIES.mobile}
				/>
			)}
			{poster?.webp?.tablet && (
				<Source
					source={poster?.webp?.tablet}
					mediaQuery={MEDIA_QUERIES.tablet}
				/>
			)}
			{poster?.webp?.desktop && <Source source={poster?.webp?.desktop} />}

			{poster?.original?.mobile && (
				<Source
					source={poster?.original?.mobile}
					mediaQuery={MEDIA_QUERIES.mobile}
				/>
			)}
			{poster?.original?.tablet && (
				<Source
					source={poster?.original?.tablet}
					mediaQuery={MEDIA_QUERIES.tablet}
				/>
			)}
			{poster?.original?.desktop && (
				<Source source={poster?.original?.desktop} />
			)}

			<img
				src={fallbackSrc}
				className={css.image}
				alt={`${poster.alt ?? 'img'}`}
				loading="lazy"
				{...imageProps}
			/>
		</picture>
	);
};
