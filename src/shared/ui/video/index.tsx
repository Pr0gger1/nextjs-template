'use client';

import { useEffect, useRef, useState, type ComponentProps } from 'react';

import type { PosterImageProps } from '../picture';
import type { Picture } from '../picture';
import css from './index.module.css';
import { MP4, WEBM } from './models/index.models';
import { Poster } from './poster';

import { MEDIA_QUERIES } from '@/shared/config/media-query';

type DimensionSourceProps = {
	desktop: string;
	tablet?: string;
	mobile?: string;
};

type SourceProps = {
	mp4: DimensionSourceProps;
	webm?: DimensionSourceProps;
};

type VideoProps = ComponentProps<'video'> & {
	source: SourceProps;
	classNamePlayButton?: string;
	playIcon?: string;
	posterPreview?: PosterImageProps;
	isSafari?: boolean;
	pictureProps?: ComponentProps<typeof Picture>;
};

export const Video = ({
	source,
	classNamePlayButton,
	playIcon,
	posterPreview,
	isSafari,
	...props
}: VideoProps) => {
	const [isPlay, setIsPlay] = useState(false);
	const videoRef = useRef<HTMLVideoElement | null>(null);

	const Mp4Nodes = (
		<>
			{source.mp4.mobile && (
				<source
					src={source.mp4.mobile}
					media={MEDIA_QUERIES.mobile}
					type={MP4}
				/>
			)}
			{source.mp4.tablet && (
				<source
					src={source.mp4.tablet}
					media={MEDIA_QUERIES.tablet}
					type={MP4}
				/>
			)}
			{source.mp4.desktop && <source src={source.mp4.desktop} type={MP4} />}
		</>
	);

	const WebmNodes = (
		<>
			{source.webm?.mobile && (
				<source
					src={source.webm.mobile}
					media={MEDIA_QUERIES.mobile}
					type={WEBM}
				/>
			)}
			{source.webm?.tablet && (
				<source
					src={source.webm.tablet}
					media={MEDIA_QUERIES.tablet}
					type={WEBM}
				/>
			)}
			{source.webm?.desktop && <source src={source.webm.desktop} type={WEBM} />}
		</>
	);

	useEffect(() => {
		if (!videoRef.current) return;

		if (isPlay) {
			videoRef.current.play();
		}
	}, [isPlay]);

	return (
		<div className={css.root}>
			{posterPreview && (
				<Poster
					classNamePlayButton={classNamePlayButton}
					playIcon={playIcon}
					posterPreview={posterPreview}
					handleClick={() => setIsPlay(true)}
					isPlay={isPlay}
				/>
			)}

			<video {...props} ref={videoRef}>
				{isSafari ? (
					<>
						{Mp4Nodes}
						{WebmNodes}
					</>
				) : (
					<>
						{WebmNodes}
						{Mp4Nodes}
					</>
				)}
				Ваш браузер не поддерживает видео
			</video>
		</div>
	);
};
