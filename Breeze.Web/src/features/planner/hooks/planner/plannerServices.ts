import useHttp from '@/shared/api/useHttp'

export interface PlannerPersonDto {
	personType: 'self' | 'spouse'
	name: string
	birthday: string
	retirementAge: number
	annualSalary: number
	bonusMode: string
	annualBonus: number
	incomeGrowthRate: number
}

export interface PlannerAccountDto {
	name: string
	owner: 'self' | 'spouse'
	accountType: string
	contributionMode: 'monthly' | 'yearly' | 'salary-percent'
	contributionValue: number
	employerMatchRate: number
	employerMatchMaxPercentOfSalary: number
	startingBalance: number
	annualRate: number
	purchaseDate?: string | null
	purchasePrice?: number | null
	currentValue?: number | null
	annualChangeRate?: number | null
	homeGrowthProfile?: string | null
	vehicleDepreciationProfile?: string | null
	hasLoan: boolean
	loanInterestRate?: number | null
	originalLoanAmount?: number | null
	loanMonthlyPayment?: number | null
	loanTermYears?: number | null
	loanStartDate?: string | null
	currentLoanBalance?: number | null
}

export interface PlannerUpsertRequest {
	desiredInvestmentAmount: number
	monthlyExpenses: number
	inflationRate: number
	safeWithdrawalRate: number
	people: PlannerPersonDto[]
	accounts: PlannerAccountDto[]
}

export interface PlannerResponse extends PlannerUpsertRequest {
	id: number
	userId: string
	createdAtUtc: string
	updatedAtUtc: string
}

export const usePlanner = () => {
	const { getOne, put } = useHttp()

	const getPlanner = async (): Promise<PlannerResponse> => await getOne<PlannerResponse>('planner')
	const getLatestBudgetMonthlyExpenses = async (): Promise<number> => await getOne<number>('planner/latest-budget-expenses')

	const upsertPlanner = async (payload: PlannerUpsertRequest): Promise<number> => put<number, PlannerUpsertRequest>('planner', payload)

	return { getPlanner, getLatestBudgetMonthlyExpenses, upsertPlanner }
}
