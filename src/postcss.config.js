const path = require('path');

module.exports = {
	plugins: {
		'postcss-import': {
			path: [path.resolve(__dirname, 'shared/styles')],
		},
		'postcss-mixins': {
			mixinsDir: path.resolve(__dirname, 'shared/styles/mixins'),
		},
		'postcss-simple-vars': {
			variables: {
				'mobile-min': '375px',
				mobile: '767px',

				'tablet-min': '768px',
				tablet: '1023px',

				'desktop-min': '1024px',
				desktop: '1439px',

				'big-screen': '1440px',

				'mobile-scale-factor': '3.75',
				'tablet-scale-factor': '10.24',
				'desktop-scale-factor': '14.4',
			},
		},
		'postcss-nested': {},
		autoprefixer: {},
	},
};
