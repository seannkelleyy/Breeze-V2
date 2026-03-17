import { type Dispatch, type SetStateAction, createContext } from 'react'

import { useUser } from '@clerk/clerk-react'

import { type AssetFinanceDetails, type PlannerAccount, type PlannerPerson, type PlannerSummary } from '@/lib/planner/types'

export type PlannerRetirementMethod = 'target-amount' | 'fire' | 'income-replacement'

export type CurrentUserContextValue = {
	user: ReturnType<typeof useUser>['user']
	userId: string
	isLoaded: boolean
	isSignedIn: boolean
	currencyCode: string
	setCurrencyCode: (nextCurrencyCode: string) => void
	returnDisplayMode: 'real' | 'nominal'
	setReturnDisplayMode: (nextReturnDisplayMode: 'real' | 'nominal') => void
	inflationRate: number
	setInflationRate: (nextInflationRate: number) => void
	safeWithdrawalRate: number
	setSafeWithdrawalRate: (nextSafeWithdrawalRate: number) => void
	plannerDesiredInvestmentAmount: number
	setPlannerDesiredInvestmentAmount: Dispatch<SetStateAction<number>>
	plannerMonthlyExpenses: number
	setPlannerMonthlyExpenses: Dispatch<SetStateAction<number>>
	plannerRetirementMethod: PlannerRetirementMethod
	setPlannerRetirementMethod: Dispatch<SetStateAction<PlannerRetirementMethod>>
	plannerFireLifestyleIndex: number
	setPlannerFireLifestyleIndex: Dispatch<SetStateAction<number>>
	plannerSummary: PlannerSummary | null
	setPlannerSummary: (summary: PlannerSummary) => void
	plannerPeople: PlannerPerson[]
	setPlannerPeople: Dispatch<SetStateAction<PlannerPerson[]>>
	plannerAccounts: PlannerAccount[]
	setPlannerAccounts: Dispatch<SetStateAction<PlannerAccount[]>>
	plannerAssetFinanceDetailsByAccountId: Record<string, AssetFinanceDetails>
	setPlannerAssetFinanceDetailsByAccountId: Dispatch<SetStateAction<Record<string, AssetFinanceDetails>>>
}

export const CurrentUserContext = createContext<CurrentUserContextValue | null>(null)
