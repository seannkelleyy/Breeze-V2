import { type ReactNode, createContext } from 'react'

import type { AccountsCardActions, AccountsCardData, AccountsCardHelpers, AccountsCardOptions } from '@/features/planner/components/AccountsCard'
import type { PeopleCardContextValue } from '@/features/planner/components/PeopleCard'
import type { ProjectionChartCardContextValue } from '@/features/planner/components/ProjectionChartCard'
import type { ProjectionTablesContextValue } from '@/features/planner/components/ProjectionTables'
import type { RetirementInputsCardContextValue } from '@/features/planner/components/RetirementInputsCard'
import type { SummaryCardsContextValue } from '@/features/planner/components/SummaryCards'

export type PlannerPageContextValue = {
	sectionUi: {
		retirementInputs: {
			collapsed: boolean
			toggleControl: ReactNode
		}
		people: {
			collapsed: boolean
			toggleControl: ReactNode
		}
		accounts: {
			collapsed: boolean
			toggleControl: ReactNode
		}
		projectionChart: {
			collapsed: boolean
			toggleControl: ReactNode
		}
		summaryCards: {
			requiredMonthlyCollapsed: boolean
			requiredMonthlyToggleControl: ReactNode
			plannedMonthlyCollapsed: boolean
			plannedMonthlyToggleControl: ReactNode
			retirementNeedCollapsed: boolean
			retirementNeedToggleControl: ReactNode
		}
		projectionTables: {
			yearlyCollapsed: boolean
			yearlyToggleControl: ReactNode
			accountBreakdownCollapsed: boolean
			accountBreakdownToggleControl: ReactNode
		}
	}
	accountsCard: {
		data: AccountsCardData
		options: AccountsCardOptions
		helpers: AccountsCardHelpers
		actions: AccountsCardActions
	}
	peopleCard: PeopleCardContextValue
	retirementInputsCard: RetirementInputsCardContextValue
	summaryCards: SummaryCardsContextValue
	projectionChartCard: ProjectionChartCardContextValue
	projectionTables: ProjectionTablesContextValue
}

export const PlannerPageContext = createContext<PlannerPageContextValue | null>(null)
