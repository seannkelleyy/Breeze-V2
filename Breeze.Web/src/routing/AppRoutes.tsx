import { useAuth, useUser } from '@clerk/clerk-react'
import { Navigate, Outlet, RouterProvider, createBrowserRouter, useNavigate } from 'react-router-dom'

import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Dashboard } from '@/pages/dashboard/Dashboard'
import { DashboardSkeleton } from '@/pages/dashboard/DashboardSkeleton'
import { LandingPage } from '@/pages/landingPage/LandingPage'
import { BudgetDataProvider } from '@/services/providers/BudgetProvider'

import { ROUTE_URLS, getHomeRoute } from './routeConfig'

const NotFound = () => {
	const navigate = useNavigate()
	const { isSignedIn } = useAuth()
	const homeUrl = getHomeRoute(isSignedIn)

	return (
		<div className="h-screen w-screen flex flex-col justify-center items-center">
			<Navigation />
			<h1 className="text-3xl font-bold mb-4">404 - Page Not Found</h1>
			<Button onClick={() => navigate(homeUrl)}>Go to Home</Button>
		</div>
	)
}

const ProtectedRoute = () => {
	const { isSignedIn, isLoaded } = useUser()

	if (!isLoaded) return <DashboardSkeleton />
	if (!isSignedIn) return <Navigate to={ROUTE_URLS.login} />

	return <Outlet />
}

const router = createBrowserRouter([
	{
		path: ROUTE_URLS.login,
		element: (
			<>
				<Navigation />
				<LandingPage />
			</>
		),
	},
	{
		path: ROUTE_URLS.signedInHome,
		element: <ProtectedRoute />,
		children: [
			{
				index: true,
				element: (
					<BudgetDataProvider>
						<Navigation />
						<Dashboard />
					</BudgetDataProvider>
				),
			},
		],
	},
	{
		path: ROUTE_URLS.notFound,
		element: <NotFound />,
	},
])

export const AppRoutes = () => <RouterProvider router={router} />
