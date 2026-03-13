import js from '@eslint/js'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
	{ ignores: ['dist'] },
	{
		extends: [js.configs.recommended, ...tseslint.configs.recommended],
		files: ['**/*.{ts,tsx}'],
		languageOptions: {
			ecmaVersion: 2020,
			globals: globals.browser,
		},
		plugins: {
			'react-hooks': reactHooks,
			'react-refresh': reactRefresh,
		},
		rules: {
			...reactHooks.configs.recommended.rules,
			'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
		},
	},
	{
		files: ['src/**/*.{ts,tsx}'],
		ignores: ['src/features/planner/**/*'],
		rules: {
			'no-restricted-imports': [
				'error',
				{
					patterns: [
						{
							group: ['@/features/planner/components/*', '@/features/planner/pages/*', '@/features/planner/hooks/*'],
							message: "Use planner's public barrel import: '@/features/planner'.",
						},
					],
				},
			],
		},
	},
	{
		files: ['src/**/*.{ts,tsx}'],
		ignores: ['src/features/mortgageTools/**/*'],
		rules: {
			'no-restricted-imports': [
				'error',
				{
					patterns: [
						{
							group: ['@/features/mortgageTools/components/*', '@/features/mortgageTools/pages/*', '@/features/mortgageTools/hooks/*'],
							message: "Use mortgage tools public barrel import: '@/features/mortgageTools'.",
						},
					],
				},
			],
		},
	},
	{
		files: ['src/**/*.{ts,tsx}'],
		ignores: ['src/features/budgeting/**/*'],
		rules: {
			'no-restricted-imports': [
				'error',
				{
					patterns: [
						{
							group: [
								'@/features/budgeting/components/*',
								'@/features/budgeting/pages/*',
								'@/features/budgeting/providers/*',
								'@/features/budgeting/hooks/*',
							],
							message: "Use budgeting public barrel import: '@/features/budgeting'.",
						},
					],
				},
			],
		},
	},
	{
		files: ['src/shared/ui/**/*.{ts,tsx}'],
		rules: {
			'react-refresh/only-export-components': 'off',
		},
	}
)
