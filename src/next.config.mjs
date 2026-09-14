/** @type {import('next').NextConfig} */
const nextConfig = {
	output: 'standalone',

	reactCompiler: true,

	turbopack: {
		rules: {
			'*.svg': {
				loaders: ['@svgr/webpack'],
				as: '*.jsx',
			},
		},
	},
};

export default nextConfig;
