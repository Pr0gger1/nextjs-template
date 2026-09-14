import type { MEDIA_QUERIES } from '@/shared/config/media-query';
import type { RetinaImageProps } from '@/shared/types/picture.types';

type SourceProps = {
	source: RetinaImageProps;
	mediaQuery?: typeof MEDIA_QUERIES.tablet | typeof MEDIA_QUERIES.mobile;
};

export const Source = ({ source, mediaQuery }: SourceProps) => {
	if (!source) return null;

    const type = source.x1.split('.').pop();

	if (mediaQuery) {
		const srcSet = source.x2
			? `${source.x1} 1x, ${source.x2} 2x`
			: `${source.x1}`;

		return <source srcSet={srcSet} media={mediaQuery} type={`image/${type}`} />;
	} else {
		const srcSet = source.x2
			? `${source.x1} 1x, ${source.x2} 2x`
			: `${source.x1}`;

		return <source srcSet={srcSet} type={`image/${type}`} />;
	}
};
