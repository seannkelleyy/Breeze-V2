import { Outlet } from 'react-router-dom'

import { Navigation } from '@/shared/navigation'

export const MainLayout = () => (
	<>
		<Navigation />
		<Outlet />
	</>
)
