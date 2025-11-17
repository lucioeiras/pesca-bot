// Flat config duplicate in TypeScript (optional). Prefer `eslint.config.js`.
import { defineConfig } from 'eslint/config'
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import globals from 'globals'
import prettier from 'eslint-config-prettier'

export default defineConfig([
	{
		files: ['**/*.{js,cjs,mjs}'],
		...js.configs.recommended,
		languageOptions: {
			sourceType: 'module',
			ecmaVersion: 2021,
			globals: {
				...globals.browser,
				...globals.node,
			},
		},
	},
	...tseslint.configs.recommended,
	prettier,
	{
		rules: {
			'no-unused-vars': 'warn',
			'no-undef': 'warn',
			quotes: ['error', 'single'],
			semi: ['error', 'never'],
			'eol-last': ['error', 'always'],
			indent: ['error', 'tab'],
			'no-mixed-spaces-and-tabs': ['error', 'smart-tabs'],
		},
	},
])
