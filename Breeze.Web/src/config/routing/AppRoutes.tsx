import { useAuth, useUser } from '@clerk/clerk-react'
import { Navigate, Outlet, RouterProvider, createBrowserRouter, useNavigate } from 'react-router-dom'

import { Loading } from '@/components/loading/Loading'
import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Dashboard } from '@/pages/dashboard/Dashboard'
import { DashboardSkeleton } from '@/pages/dashboard/DashboardSkeleton'
import { LandingPage } from '@/pages/landingPage/LandingPage'
import { BudgetDataProvider } from '@/services/providers/BudgetProvider'

const NotFound = () => {
	const navigate = useNavigate()

	//TODO: Make Urls global variables or environment variables
	const homeUrl = useAuth().isSignedIn ? '/' : '/login'

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

	// TODO: Add proper loading state handling using suspense
	if (!isLoaded) return <Loading />
	if (!isSignedIn) return <Navigate to="/login" />

	return <Outlet />
}

const router = createBrowserRouter([
	{
		path: '/login',
		element: (
			<>
				<Navigation />
				<LandingPage />
			</>
		),
	},
	{
		path: '/loading',
		element: <DashboardSkeleton />,
	},
	{
		path: '/',
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
		path: '*',
		element: <NotFound />,
	},
])

export const AppRoutes = () => <RouterProvider router={router} />
