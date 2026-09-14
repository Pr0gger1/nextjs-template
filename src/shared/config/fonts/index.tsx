import localFont from 'next/font/local';

export const InterFont = localFont({
	src: [
		{
			path: '../../../public/fonts/Inter-Light.woff2',
			weight: '300',
			style: 'normal',
		},
		{
			path: '../../../public/fonts/Inter-Regular.woff2',
			weight: '400',
			style: 'normal',
		},
		{
			path: '../../../public/fonts/Inter-Medium.woff2',
			weight: '500',
			style: 'normal',
		},
		{
			path: '../../../public/fonts/Inter-SemiBold.woff2',
			weight: '600',
			style: 'normal',
		},
		{
			path: '../../../public/fonts/Inter-Bold.woff2',
			weight: '700',
			style: 'normal',
		},
	],
	display: 'swap',
});
