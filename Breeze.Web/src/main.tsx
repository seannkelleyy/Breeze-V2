import { StrictMode } from 'react'

import { ClerkProvider } from '@clerk/clerk-react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ReactDOM from 'react-dom/client'

import './index.css'
import { AppRoutes } from './routing/AppRoutes'
import { ThemeProvider } from './services/providers/ThemeProvider'

const queryClient = new QueryClient()

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
	throw new Error('Missing Publishable Key')
}

ReactDOM.createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<QueryClientProvider client={queryClient}>
			<ThemeProvider defaultTheme="system">
				<ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/login" signInForceRedirectUrl={'/'}>
					<AppRoutes />
				</ClerkProvider>
			</ThemeProvider>
		</QueryClientProvider>
	</StrictMode>
)
