export type AccountType =
	| '401k'
	| 'roth-ira'
	| 'traditional-ira'
	| 'hsa'
	| 'brokerage'
	| '403b'
	| '457'
	| 'home'
	| 'vehicle'
	| 'checking'
	| 'emergency-fund'
	| 'student-loan'
	| 'credit-card'
	| 'personal-loan'
	| 'other'

export type AccountOwner = 'self' | 'spouse'
export type ContributionMode = 'monthly' | 'yearly' | 'salary-percent'
export type AccountRateProfile = 'none' | 'money-market' | 'bonds' | 'stock-bond-mix' | 'stocks' | 'custom'
export type IrsLimitKey = '401k' | '403b' | '457' | 'roth-ira' | 'traditional-ira' | 'hsa'

export type IrsLimitRule = {
	baseAnnualLimit: number
	familyAnnualLimit?: number
	catchUpAmount: number
	catchUpAge: number
}

export type IrsLimitConfig = Record<IrsLimitKey, IrsLimitRule>

export type SectionKey =
	| 'people'
	| 'retirementInputs'
	| 'plannerTools'
	| 'accounts'
	| 'requiredMonthly'
	| 'plannedMonthly'
	| 'retirementEstimateCard'
	| 'projectionChart'
	| 'yearlyProjection'
	| 'accountBreakdown'

export type PersonType = 'self' | 'spouse'
export type BonusMode = 'dollars' | 'salary-percent'

export type PlannerPerson = {
	id: string
	type: PersonType
	name: string
	birthday: string
	retirementAge: number
	annualSalary: number
	bonusMode: BonusMode
	annualBonus: number
	incomeGrowthRate: number
}

export type PlannerAccount = {
	id: string
	name: string
	owner: AccountOwner
	accountType: AccountType
	contributionMode: ContributionMode
	contributionValue: number
	employerMatchRate: number
	employerMatchMaxPercentOfSalary: number
	startingBalance: number
	annualRate: number
}

export type ProjectionRow = {
	age: number
	totalBalance: number
	totalContributions: number
	[key: `account-${number}`]: number
}

export type VehicleDepreciationProfile = 'low' | 'medium' | 'high' | 'custom'
export type HomeGrowthProfile = 'none' | 'low' | 'medium' | 'high' | 'custom'

export type AssetFinanceDetails = {
	purchaseDate: string
	purchasePrice: number
	currentValue: number
	annualChangeRate: number
	homeGrowthProfile: HomeGrowthProfile
	vehicleDepreciationProfile: VehicleDepreciationProfile
	hasLoan: boolean
	loanInterestRate: number
	originalLoanAmount: number
	loanMonthlyPayment: number
	loanTermYears: number
	loanStartDate: string
	currentLoanBalance: number
}

export type AssetFinanceSnapshot = {
	assetValue: number
	loanBalance: number
	equity: number
	monthsSincePurchase: number
	remainingLoanMonths: number
}
