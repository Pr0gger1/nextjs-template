import nextPlugin from '@next/eslint-plugin-next';
import { defineConfig } from 'eslint/config';
import eslintPluginImport from 'eslint-plugin-import';
import noRelativeImportPaths from 'eslint-plugin-no-relative-import-paths';
import react from 'eslint-plugin-react';
import hooksPlugin from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

export default defineConfig(
	tseslint.configs.recommended,
	{
		ignores: [
			'node_modules',
			'.turbo',
			'.next',
			'build',
			'coverage',
			'global.d.ts',
			'junit.xml',
		],
	},
	{
		files: ['**/*.{js,mjs,ts,tsx}'],
		plugins: {
			import: eslintPluginImport,
			'no-relative-import-paths': noRelativeImportPaths,
			'@next/next': nextPlugin,
			'react-hooks': hooksPlugin,
		},
		rules: {
			...hooksPlugin.configs.recommended.rules,
			...nextPlugin.configs.recommended.rules,
			...nextPlugin.configs['core-web-vitals'].rules,
			'object-curly-spacing': ['error', 'always'],
			'import/order': [
				'error',
				{
					groups: [
						'builtin',
						'external',
						'internal',
						['sibling', 'parent'],
						'index',
						'unknown',
					],
					'newlines-between': 'always',
					alphabetize: {
						order: 'asc',
						caseInsensitive: true,
					},
				},
			],
		},
	},
	{
		extends: [
			react.configs.flat['jsx-runtime'],
			...tseslint.configs.recommended,
		],
		files: ['**/*.{js,md,mjs,ts,tsx}'],
		rules: {
			'@typescript-eslint/array-type': ['error', { default: 'generic' }],
			'@typescript-eslint/consistent-type-imports': 'error',
			'@typescript-eslint/no-require-imports': 'off',
			'@next/next/no-duplicate-head': 'off',
			'@next/next/no-img-element': 'off',
			'import/no-duplicates': 'off',
		},
		settings: {
			react: {
				version: 'detect',
			},
		},
	},
	{
		files: ['**/*.md'],
		rules: {
			'no-irregular-whitespace': 'off',
			'@next/next/no-img-element': 'off',
			'@next/next/no-html-link-for-pages': ['error', 'apps/site/pages/'],

			// https://github.com/typescript-eslint/typescript-eslint/issues/9860
			'@typescript-eslint/consistent-type-imports': 'off',
		},
	},
	{
		files: ['**/*.tsx'],
		rules: {
			'@typescript-eslint/consistent-type-definitions': ['error', 'type'],
			'react/no-unescaped-entities': 'off',
			'react/function-component-definition': [
				'error',
				{
					namedComponents: 'arrow-function',
					unnamedComponents: 'arrow-function',
				},
			],
			'no-restricted-syntax': [
				'error',
				{
					selector:
						"ImportDeclaration[source.value='react'][specifiers.0.type='ImportDefaultSpecifier']",
					message:
						'Default React import not allowed since we use the TypeScript jsx-transform. If you need a global type that collides with a React named export (such as `MouseEvent`), try using `globalThis.MouseHandler`',
				},
				{
					selector:
						"ImportDeclaration[source.value='react'] :matches(ImportNamespaceSpecifier)",
					message:
						'Named * React import is not allowed. Please import what you need from React with Named Imports',
				},
			],
		},
	},
	{
		files: ['**/*.mjs'],
		rules: {
			'no-relative-import-paths/no-relative-import-paths': 'off',
		},
	},
);
