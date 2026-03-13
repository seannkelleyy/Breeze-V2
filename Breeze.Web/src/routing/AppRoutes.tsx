import { Navigate, Outlet, RouterProvider, createBrowserRouter, useNavigate } from 'react-router-dom'

import { Dashboard, DashboardSkeleton } from '@/features/budgeting'
import { BudgetDataProvider } from '@/features/budgeting/providers'
import { LandingPage } from '@/features/landingPage'
import { MortgageTools } from '@/features/mortgageTools'
import { Planner } from '@/features/planner'
import { useCurrentUser } from '@/shared/breezeAuthButton'
import { Navigation } from '@/shared/navigation'
import { Button } from '@/shared/ui/button'

import { ROUTE_URLS, getHomeRoute } from './routeConfig'

const NotFound = () => {
	const navigate = useNavigate()
	const { isSignedIn } = useCurrentUser()
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
	const { isSignedIn, isLoaded } = useCurrentUser()

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
		path: ROUTE_URLS.planner,
		element: <Planner />,
	},
	{
		path: ROUTE_URLS.mortgageTools,
		element: <MortgageTools />,
	},
	{
		path: ROUTE_URLS.notFound,
		element: <NotFound />,
	},
])

export const AppRoutes = () => <RouterProvider router={router} />
