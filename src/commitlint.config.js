module.exports = {
	extends: ['@commitlint/config-conventional'],
	rules: {
		'type-enum': [
			2,
			'always',
			['feat', 'fix', 'docs', 'refactor', 'ci', 'build'],
		],
		'header-max-length': [2, 'always', 200],
		'header-min-length': [2, 'always', 3],
		'subject-case': [0, 'always'],
		'subject-empty': [2, 'never'],
		'subject-full-stop': [2, 'never', '.'],
		'type-case': [2, 'always', ['lower-case']],
		'type-empty': [2, 'never'],
	},
};
