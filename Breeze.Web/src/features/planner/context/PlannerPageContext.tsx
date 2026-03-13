import type { ReactNode } from 'react'

import { PlannerPageContext, type PlannerPageContextValue } from './PlannerPageStore'

type PlannerPageProviderProps = {
	value: PlannerPageContextValue
	children: ReactNode
}

export const PlannerPageProvider = ({ value, children }: PlannerPageProviderProps) => {
	return <PlannerPageContext.Provider value={value}>{children}</PlannerPageContext.Provider>
}
