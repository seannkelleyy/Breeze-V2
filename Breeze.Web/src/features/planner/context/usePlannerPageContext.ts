import { useContext } from 'react'

import { PlannerPageContext } from './PlannerPageStore'

export const usePlannerPageContext = () => {
	const context = useContext(PlannerPageContext)
	if (!context) {
		throw new Error('usePlannerPageContext must be used within a PlannerPageProvider')
	}

	return context
}
