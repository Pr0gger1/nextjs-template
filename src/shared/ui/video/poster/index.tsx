import clsx from 'clsx';

import css from './index.module.css';
import { Picture, type PosterImageProps } from '../../picture';
import { FALLBACK_PLAY_ICON } from '../models/index.models';

type PosterProps = {
	handleClick: () => void;
	isPlay: boolean;
	playIcon?: string;
	posterPreview?: PosterImageProps;
	classNamePlayButton?: string;
};

export const Poster = ({
	playIcon,
	classNamePlayButton,
	posterPreview,
	handleClick,
	isPlay,
}: PosterProps) => {
	const handleKeyDown = (e: React.KeyboardEvent) => {
		const isEnter = e.key === 'Enter';
		const isSpace = e.key === ' ';
		if (!isEnter && !isSpace) return;

		if (isSpace) e.preventDefault();
		handleClick();
	};

	return (
		<div
			className={clsx(css.poster, { [css.hidden]: isPlay })}
			onClick={handleClick}
			onKeyDown={handleKeyDown}
			tabIndex={0}
			role="button"
			aria-label="Воспроизвести видео"
		>
			{posterPreview && (
				<Picture poster={posterPreview} className={css.posterImage} />
			)}

			<img
				className={clsx(classNamePlayButton, css.playButton)}
				src={playIcon ?? FALLBACK_PLAY_ICON}
				alt="Воспроизвести видео"
			/>
		</div>
	);
};
