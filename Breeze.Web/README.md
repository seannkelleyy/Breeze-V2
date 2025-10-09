# Breeze Web Frontend

This Vite + React + TypeScript application powers the Breeze web experience.

## Environment Variables

Configure the following variables in a `.env.local` (or `.env`) file at the root of `Breeze.Web` and restart the dev server after changes:

| Variable                     | Purpose                                                      | Default  |
| ---------------------------- | ------------------------------------------------------------ | -------- |
| `VITE_ROUTE_HOME_SIGNED_IN`  | Primary home route presented to authenticated users.         | `/`      |
| `VITE_ROUTE_HOME_SIGNED_OUT` | Default landing route when a user is signed out.             | `/login` |
| `VITE_ROUTE_LOGIN`           | Path used when redirecting unauthenticated users to sign in. | `/login` |
| `VITE_ROUTE_NOT_FOUND`       | Route pattern matched for unknown pages.                     | `*`      |

When unset, the defaults above are applied automatically. Adjust these values to customize routing without changing source code.

## React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
	languageOptions: {
		// other options...
		parserOptions: {
			project: ['./tsconfig.node.json', './tsconfig.app.json'],
			tsconfigRootDir: import.meta.dirname,
		},
	},
})
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
	// Set the react version
	settings: { react: { version: '18.3' } },
	plugins: {
		// Add the react plugin
		react,
	},
	rules: {
		// other rules...
		// Enable its recommended rules
		...react.configs.recommended.rules,
		...react.configs['jsx-runtime'].rules,
	},
})
```
