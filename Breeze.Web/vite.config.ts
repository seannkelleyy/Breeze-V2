import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react(), tailwindcss()],
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
	build: {
		outDir: path.resolve(__dirname, './dist'),
		rollupOptions: {
			output: {
				manualChunks: (id) => {
					if (!id.includes('node_modules')) {
						return undefined
					}

					if (id.includes('/node_modules/@clerk/')) {
						return 'auth'
					}

					if (
						id.includes('/node_modules/react-router-dom/') ||
						id.includes('/node_modules/react-router/') ||
						id.includes('/node_modules/@remix-run/router/')
					) {
						return 'router'
					}

					if (id.includes('/node_modules/@tanstack/react-query/') || id.includes('/node_modules/axios/')) {
						return 'data'
					}

					if (id.includes('/node_modules/@tanstack/react-table/')) {
						return 'table'
					}

					if (
						id.includes('/node_modules/react-hook-form/') ||
						id.includes('/node_modules/@hookform/resolvers/') ||
						id.includes('/node_modules/zod/')
					) {
						return 'forms'
					}

					if (id.includes('/node_modules/@radix-ui/')) {
						return 'radix'
					}

					if (id.includes('/node_modules/recharts/')) {
						return 'charts'
					}

					if (id.includes('/node_modules/lucide-react/')) {
						return 'icons'
					}

					if (id.includes('/node_modules/dayjs/')) {
						return 'date'
					}

					if (
						id.includes('/node_modules/react/') ||
						id.includes('/node_modules/react-dom/') ||
						id.includes('/node_modules/scheduler/') ||
						id.includes('/node_modules/react-is/')
					) {
						return 'react'
					}

					return 'vendor'
				},
			},
		},
	},
})
