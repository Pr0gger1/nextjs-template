export type RetinaImageProps = {
	x1: string;
	x2?: string;
};

export type ImageProps = {
	desktop: RetinaImageProps;
	mobile?: RetinaImageProps;
	tablet?: RetinaImageProps;
};

export type ImageSrc = {
	src: string;
	alt: string;
};
