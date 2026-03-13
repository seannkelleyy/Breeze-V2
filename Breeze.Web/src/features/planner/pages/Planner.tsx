import { useCallback, useEffect, useMemo, useState } from 'react'

import { ChevronDown, ChevronUp } from 'lucide-react'
import { Link } from 'react-router-dom'

import { AccountsCard, PeopleCard, ProjectionChartCard, ProjectionTables, RetirementInputsCard, SummaryCards } from '@/features/planner/components'
import { PlannerPageProvider } from '@/features/planner/context'
import {
	type PlannerUpsertRequest,
	useFetchIRSAccounts,
	useFetchPlanner,
	usePlanner,
	usePlannerPersistence,
	usePutPlanner,
} from '@/features/planner/hooks'
import {
	accountLineColors,
	clamp,
	defaultIrsLimits,
	formatCurrencyWithCode,
	getAccountAnnualRateFromProfile,
	getAgeFromBirthday,
	getAnnualIncomeWithGrowth,
	getAssetFinanceSnapshot,
	getDefaultAssetFinanceDetailsForAccount,
	getDisplayedRatePercent,
	getEffectiveAnnualRatePercent,
	getEmployeeMonthlyContribution,
	getEmployerMatchMonthly,
	getHomeAnnualGrowthRate,
	getIrsLimitKeyFromApiType,
	getMonthlyContribution,
	getNetWorthStartingBalance,
	getProjection,
	getRealAnnualRatePercent,
	getStoredAnnualRateFromInput,
	getSuggestedAnnualLimit,
	getSuggestedSafeWithdrawalRate,
	getTotalAnnualIncome,
	getTotalMonthlyForAccount,
	normalizeBonusMode,
	plannerChartConfig,
	toIsoDate,
} from '@/features/planner/lib/plannerMath'
import * as plannerConstants from '@/lib/constants'
import * as plannerConfig from '@/lib/planner/config'
import type * as PlannerTypes from '@/lib/planner/types'
import { ROUTE_URLS } from '@/routing/routeConfig'
import { useCurrentUser } from '@/shared/breezeAuthButton'
import { FormattedNumberInput } from '@/shared/form/FormattedNumberInput'
import { Navigation } from '@/shared/navigation'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import type { ChartConfig } from '@/shared/ui/chart'
import { Label } from '@/shared/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'

type AccountRateProfile = PlannerTypes.AccountRateProfile
type AssetFinanceDetails = PlannerTypes.AssetFinanceDetails
type HomeGrowthProfile = PlannerTypes.HomeGrowthProfile
type IrsLimitConfig = PlannerTypes.IrsLimitConfig
type IrsLimitKey = PlannerTypes.IrsLimitKey
type PlannerAccount = PlannerTypes.PlannerAccount
type PlannerPerson = PlannerTypes.PlannerPerson
type SectionKey = PlannerTypes.SectionKey
type VehicleDepreciationProfile = PlannerTypes.VehicleDepreciationProfile
type RetirementMethod = 'target-amount' | 'fire' | 'income-replacement'
type PlannerSection = 'overview' | 'personal' | 'accounts' | 'mortgage' | 'settings'

const {
	accountOwnerOptions,
	accountTypeOptions,
	contributionModeOptions,
	homeGrowthProfileOptions,
	isCombinedAssetType,
	isDepreciatingAssetType,
	isLiabilityAccountType,
	isNonContributingAccountType,
	liabilityContributionModeOptions,
	vehicleDepreciationProfileOptions,
} = plannerConfig

export const Planner = () => {
	const { isSignedIn, currencyCode, setCurrencyCode, returnDisplayMode, setReturnDisplayMode } = useCurrentUser()
	const [desiredInvestmentAmount, setDesiredInvestmentAmount] = useState(plannerConstants.PLANNER_DEFAULT_DESIRED_INVESTMENT_AMOUNT)
	const [people, setPeople] = useState<PlannerPerson[]>([
		{
			id: crypto.randomUUID(),
			...plannerConstants.PLANNER_DEFAULT_SELF_PERSON,
		},
	])
	const [irsLimits, setIrsLimits] = useState<IrsLimitConfig>(defaultIrsLimits)
	const [monthlyExpenses, setMonthlyExpenses] = useState(plannerConstants.PLANNER_DEFAULT_MONTHLY_EXPENSES)
	const [inflationRate, setInflationRate] = useState(plannerConstants.PLANNER_DEFAULT_INFLATION_RATE)
	const [safeWithdrawalRate, setSafeWithdrawalRate] = useState(plannerConstants.PLANNER_DEFAULT_SAFE_WITHDRAWAL_RATE)
	const [retirementMethod, setRetirementMethod] = useState<RetirementMethod>(plannerConstants.PLANNER_DEFAULT_RETIREMENT_METHOD)
	const useInflationAdjustedValues = returnDisplayMode === 'real'
	const setUseInflationAdjustedValues = (value: boolean) => {
		setReturnDisplayMode(value ? 'real' : 'nominal')
	}
	const formatCurrency = (value: number) => formatCurrencyWithCode(value, currencyCode)
	const accountRateProfileOptions = useMemo(
		() =>
			plannerConfig.accountRateProfileOptions.map((option) => {
				if (option.value === 'custom') {
					return option
				}

				const nominalRate = plannerConstants.PLANNER_ACCOUNT_RATE_PROFILE_RATES[option.value]
				const displayRate = useInflationAdjustedValues ? getRealAnnualRatePercent(nominalRate, inflationRate) : nominalRate
				const labelPrefix = option.label.split(' (')[0]

				return {
					...option,
					label: `${labelPrefix} (${displayRate.toFixed(1)}%)`,
				}
			}),
		[inflationRate, useInflationAdjustedValues]
	)
	const [fireLifestyleIndex, setFireLifestyleIndex] = useState(plannerConstants.PLANNER_DEFAULT_FIRE_LIFESTYLE_INDEX)
	const [accounts, setAccounts] = useState<PlannerAccount[]>([
		{
			id: crypto.randomUUID(),
			...plannerConstants.PLANNER_DEFAULT_PRIMARY_401K_ACCOUNT,
		},
		{
			id: crypto.randomUUID(),
			...plannerConstants.PLANNER_DEFAULT_PRIMARY_ROTH_ACCOUNT,
		},
	])
	const [assetFinanceDetailsByAccountId, setAssetFinanceDetailsByAccountId] = useState<Record<string, AssetFinanceDetails>>({})
	const [isRefreshingExpenses, setIsRefreshingExpenses] = useState(false)
	const { data: plannerData, isLoading: isPlannerLoading, isError: isPlannerError } = useFetchPlanner()
	const { getLatestBudgetMonthlyExpenses } = usePlanner()
	const putPlannerMutation = usePutPlanner()
	const { data: irsAccountData, isLoading: isIrsAccountsLoading, isError: isIrsAccountsError } = useFetchIRSAccounts()

	const getDefaultAssetFinanceDetails = useCallback(
		(account: PlannerAccount): AssetFinanceDetails => getDefaultAssetFinanceDetailsForAccount(account),
		[]
	)

	const updateAssetFinanceDetails = (accountId: string, updater: (current: AssetFinanceDetails) => AssetFinanceDetails) => {
		setAssetFinanceDetailsByAccountId((prev) => {
			const fallbackAccount = accounts.find((account) => account.id === accountId)
			const fallback = fallbackAccount
				? getDefaultAssetFinanceDetails(fallbackAccount)
				: getDefaultAssetFinanceDetails({
						id: accountId,
						name: 'Asset',
						owner: 'self',
						accountType: 'home',
						contributionMode: 'monthly',
						contributionValue: 0,
						employerMatchRate: 0,
						employerMatchMaxPercentOfSalary: 0,
						startingBalance: 1,
						annualRate: 4,
					})
			const nextDetails = updater(prev[accountId] ?? fallback)

			updateAccount(accountId, (current) => ({
				...current,
				startingBalance: clamp(nextDetails.currentValue),
				annualRate: nextDetails.annualChangeRate,
			}))

			return {
				...prev,
				[accountId]: nextDetails,
			}
		})
	}

	const createPlannerPayload = useCallback(
		(
			nextDesiredInvestmentAmount: number,
			nextMonthlyExpenses: number,
			nextInflationRate: number,
			nextSafeWithdrawalRate: number,
			nextPeople: PlannerPerson[],
			nextAccounts: PlannerAccount[],
			nextAssetFinanceDetailsByAccountId: Record<string, AssetFinanceDetails>
		): PlannerUpsertRequest => ({
			desiredInvestmentAmount: nextDesiredInvestmentAmount,
			monthlyExpenses: nextMonthlyExpenses,
			inflationRate: nextInflationRate,
			safeWithdrawalRate: nextSafeWithdrawalRate,
			people: nextPeople.map((person) => ({
				personType: person.type,
				name: person.name,
				birthday: person.birthday,
				retirementAge: clamp(person.retirementAge),
				annualSalary: clamp(person.annualSalary),
				bonusMode: normalizeBonusMode(person.bonusMode),
				annualBonus: clamp(person.annualBonus),
				incomeGrowthRate: person.incomeGrowthRate,
			})),
			accounts: nextAccounts.map((account) => {
				const details = isCombinedAssetType(account.accountType)
					? (nextAssetFinanceDetailsByAccountId[account.id] ?? getDefaultAssetFinanceDetails(account))
					: undefined

				return {
					name: account.name,
					owner: account.owner,
					accountType: account.accountType,
					contributionMode: account.contributionMode,
					contributionValue: clamp(account.contributionValue),
					employerMatchRate: clamp(account.employerMatchRate),
					employerMatchMaxPercentOfSalary: clamp(account.employerMatchMaxPercentOfSalary),
					startingBalance: clamp(account.startingBalance),
					annualRate: account.annualRate,
					purchaseDate: details?.purchaseDate || null,
					purchasePrice: details ? clamp(details.purchasePrice) : null,
					currentValue: details ? clamp(details.currentValue) : null,
					annualChangeRate: details ? details.annualChangeRate : null,
					homeGrowthProfile: details?.homeGrowthProfile ?? null,
					vehicleDepreciationProfile: details?.vehicleDepreciationProfile ?? null,
					hasLoan: details?.hasLoan ?? false,
					loanInterestRate: details?.hasLoan ? details.loanInterestRate : null,
					originalLoanAmount: details?.hasLoan ? clamp(details.originalLoanAmount) : null,
					loanMonthlyPayment: details?.hasLoan ? clamp(details.loanMonthlyPayment) : null,
					loanTermYears: details?.hasLoan ? Math.max(1, Math.round(clamp(details.loanTermYears))) : null,
					loanStartDate: details?.hasLoan ? details.loanStartDate : null,
					currentLoanBalance: details?.hasLoan ? clamp(details.currentLoanBalance) : null,
				}
			}),
		}),
		[getDefaultAssetFinanceDetails]
	)

	const { hasPlannerSaveError, lastPlannerSavedAt } = usePlannerPersistence({
		isSignedIn,
		isPlannerLoading,
		isPlannerError,
		plannerData,
		putPlannerMutation,
		createPlannerPayload,
		desiredInvestmentAmount,
		monthlyExpenses,
		inflationRate,
		safeWithdrawalRate,
		people,
		accounts,
		assetFinanceDetailsByAccountId,
		setDesiredInvestmentAmount,
		setMonthlyExpenses,
		setInflationRate,
		setSafeWithdrawalRate,
		setPeople,
		setAccounts,
		setAssetFinanceDetailsByAccountId,
	})

	const refreshMonthlyExpenses = async () => {
		if (!isSignedIn) {
			return
		}

		try {
			setIsRefreshingExpenses(true)
			const latestExpenses = await getLatestBudgetMonthlyExpenses()
			setMonthlyExpenses(clamp(latestExpenses))
		} finally {
			setIsRefreshingExpenses(false)
		}
	}

	useEffect(() => {
		if (!irsAccountData || irsAccountData.length === 0) {
			return
		}

		setIrsLimits((prev) => {
			const nextLimits: IrsLimitConfig = { ...prev }
			const hasType: Partial<Record<IrsLimitKey, boolean>> = {}

			for (const accountType of irsAccountData) {
				const mappedType = getIrsLimitKeyFromApiType(accountType.type)
				if (!mappedType) {
					continue
				}

				hasType[mappedType] = true
				nextLimits[mappedType] = {
					baseAnnualLimit: clamp(accountType.maxAmount),
					familyAnnualLimit: clamp(accountType.familyMaxAmount ?? 0),
					catchUpAmount: clamp(accountType.catchUpAmount),
					catchUpAge: clamp(accountType.catchUpAge),
				}
			}

			if (!hasType['403b'] && hasType['401k']) {
				nextLimits['403b'] = { ...nextLimits['401k'] }
			}

			if (!hasType['457'] && hasType['401k']) {
				nextLimits['457'] = { ...nextLimits['401k'] }
			}

			return nextLimits
		})
	}, [irsAccountData])

	const selfPerson = useMemo(() => people.find((person) => person.type === 'self') ?? people[0], [people])
	const spousePerson = useMemo(() => people.find((person) => person.type === 'spouse'), [people])
	const hasSpouse = Boolean(spousePerson)
	const selfAnnualIncome = getTotalAnnualIncome(selfPerson)
	const spouseAnnualIncome = getTotalAnnualIncome(spousePerson)
	const selfIncomeGrowthRate = selfPerson?.incomeGrowthRate ?? plannerConstants.PLANNER_DEFAULT_INCOME_GROWTH_RATE
	const spouseIncomeGrowthRate = spousePerson?.incomeGrowthRate ?? plannerConstants.PLANNER_DEFAULT_INCOME_GROWTH_RATE
	const currentAge = selfPerson ? getAgeFromBirthday(selfPerson.birthday) : 0
	const targetAge = people.length > 0 ? Math.max(...people.map((person) => person.retirementAge)) : currentAge
	const yearsToGoal = Math.max(0, targetAge - currentAge)
	const totalStartingBalance = useMemo(
		() =>
			accounts.reduce((sum, account) => {
				if (isCombinedAssetType(account.accountType)) {
					const details = assetFinanceDetailsByAccountId[account.id]
					if (details) {
						return sum + getAssetFinanceSnapshot(details, new Date()).equity
					}
				}

				return sum + getNetWorthStartingBalance(account)
			}, 0),
		[accounts, assetFinanceDetailsByAccountId]
	)
	const totalAssets = useMemo(
		() =>
			accounts
				.filter((account) => !isLiabilityAccountType(account.accountType))
				.reduce((sum, account) => {
					if (isCombinedAssetType(account.accountType)) {
						return sum + clamp(assetFinanceDetailsByAccountId[account.id]?.currentValue ?? account.startingBalance)
					}

					return sum + clamp(account.startingBalance)
				}, 0),
		[accounts, assetFinanceDetailsByAccountId]
	)
	const totalLiabilities = useMemo(
		() =>
			accounts.reduce((sum, account) => {
				if (isLiabilityAccountType(account.accountType)) {
					return sum + clamp(account.startingBalance)
				}

				if (isCombinedAssetType(account.accountType)) {
					const details = assetFinanceDetailsByAccountId[account.id]
					if (details?.hasLoan) {
						return sum + clamp(details.currentLoanBalance)
					}
				}

				return sum
			}, 0),
		[accounts, assetFinanceDetailsByAccountId]
	)
	const totalPlannedMonthlyEmployee = useMemo(
		() => accounts.reduce((sum, account) => sum + getEmployeeMonthlyContribution(account, selfAnnualIncome, spouseAnnualIncome), 0),
		[accounts, selfAnnualIncome, spouseAnnualIncome]
	)
	const totalPlannedMonthlyMatch = useMemo(
		() => accounts.reduce((sum, account) => sum + getEmployerMatchMonthly(account, selfAnnualIncome, spouseAnnualIncome), 0),
		[accounts, selfAnnualIncome, spouseAnnualIncome]
	)
	const totalPlannedMonthlyInvestment = totalPlannedMonthlyEmployee + totalPlannedMonthlyMatch
	const annualHouseholdIncome = selfAnnualIncome + spouseAnnualIncome
	const currentSavingsRateEmployeePercent = annualHouseholdIncome > 0 ? (totalPlannedMonthlyEmployee * 12 * 100) / annualHouseholdIncome : 0
	const currentSavingsRateTotalPercent = annualHouseholdIncome > 0 ? (totalPlannedMonthlyInvestment * 12 * 100) / annualHouseholdIncome : 0

	const weightedAnnualRate = useMemo(() => {
		const totalWeightedContribution = accounts.reduce(
			(sum, account) => sum + getTotalMonthlyForAccount(account, selfAnnualIncome, spouseAnnualIncome),
			0
		)
		if (totalWeightedContribution === 0) {
			return accounts.length > 0 ? accounts.reduce((sum, account) => sum + account.annualRate, 0) / accounts.length : 0
		}

		return accounts.reduce(
			(sum, account) =>
				sum + (getTotalMonthlyForAccount(account, selfAnnualIncome, spouseAnnualIncome) / totalWeightedContribution) * account.annualRate,
			0
		)
	}, [accounts, selfAnnualIncome, spouseAnnualIncome])
	const effectiveWeightedAnnualRate = useMemo(
		() => getEffectiveAnnualRatePercent(weightedAnnualRate, inflationRate, useInflationAdjustedValues),
		[weightedAnnualRate, inflationRate, useInflationAdjustedValues]
	)

	const annualNeedToday = monthlyExpenses * 12
	const inflationFactor = (1 + inflationRate / 100) ** yearsToGoal
	const annualNeedAtRetirement = useInflationAdjustedValues ? annualNeedToday : annualNeedToday * inflationFactor
	const baseFinancialFreedomTarget = safeWithdrawalRate > 0 ? annualNeedAtRetirement / (safeWithdrawalRate / 100) : 0
	const retirementHorizonYears = Math.max(1, plannerConstants.PLANNER_DEFAULT_LONGEVITY_AGE - targetAge)
	const suggestedSafeWithdrawalRate = getSuggestedSafeWithdrawalRate(retirementHorizonYears)
	const selfAnnualIncomeAtRetirement = getAnnualIncomeWithGrowth(selfAnnualIncome, selfIncomeGrowthRate, yearsToGoal)
	const spouseAnnualIncomeAtRetirement = getAnnualIncomeWithGrowth(spouseAnnualIncome, spouseIncomeGrowthRate, yearsToGoal)
	const projectedHouseholdIncomeAtRetirementNominal = selfAnnualIncomeAtRetirement + spouseAnnualIncomeAtRetirement
	const projectedHouseholdIncomeAtRetirement =
		useInflationAdjustedValues && inflationFactor > 0
			? projectedHouseholdIncomeAtRetirementNominal / inflationFactor
			: projectedHouseholdIncomeAtRetirementNominal
	const incomeReplacementAnnualNeed = projectedHouseholdIncomeAtRetirement * (plannerConstants.PLANNER_DEFAULT_INCOME_REPLACEMENT_RATE / 100)
	const incomeReplacementTarget = safeWithdrawalRate > 0 ? incomeReplacementAnnualNeed / (safeWithdrawalRate / 100) : 0
	const fireTargets = useMemo(
		() =>
			plannerConstants.PLANNER_FIRE_LIFESTYLE_OPTIONS.map((option) => ({
				label: option.label,
				target: baseFinancialFreedomTarget * option.multiplier,
				monthlySpendSupported: safeWithdrawalRate > 0 ? (baseFinancialFreedomTarget * option.multiplier * (safeWithdrawalRate / 100)) / 12 : 0,
			})),
		[baseFinancialFreedomTarget, safeWithdrawalRate]
	)
	const safeFireLifestyleIndex = Math.max(0, Math.min(fireLifestyleIndex, fireTargets.length - 1))
	const fireTarget = fireTargets[safeFireLifestyleIndex]?.target ?? baseFinancialFreedomTarget
	const selectedRetirementTarget =
		retirementMethod === 'target-amount' ? desiredInvestmentAmount : retirementMethod === 'income-replacement' ? incomeReplacementTarget : fireTarget
	const selectedRetirementMethodLabel =
		plannerConstants.PLANNER_RETIREMENT_METHOD_OPTIONS.find((option) => option.value === retirementMethod)?.label ?? 'Selected Method'
	const financialFreedomTarget = fireTarget

	const monthlyNeededForDesiredTarget = getMonthlyContribution(
		selectedRetirementTarget,
		totalStartingBalance,
		effectiveWeightedAnnualRate,
		yearsToGoal
	)
	const monthlyNeededForFreedomTarget = getMonthlyContribution(financialFreedomTarget, totalStartingBalance, effectiveWeightedAnnualRate, yearsToGoal)
	const requiredSavingsRatePercent = annualHouseholdIncome > 0 ? (monthlyNeededForDesiredTarget * 12 * 100) / annualHouseholdIncome : 0
	const savingsRateGapPercent = currentSavingsRateTotalPercent - requiredSavingsRatePercent

	const { projectionRows, finalBalances } = useMemo(
		() =>
			getProjection(
				accounts,
				currentAge,
				targetAge,
				selfAnnualIncome,
				spouseAnnualIncome,
				selfIncomeGrowthRate,
				spouseIncomeGrowthRate,
				assetFinanceDetailsByAccountId,
				irsLimits,
				hasSpouse,
				plannerConstants.PLANNER_DEFAULT_IRS_LIMIT_GROWTH_RATE,
				currentAge,
				spousePerson ? getAgeFromBirthday(spousePerson.birthday) : currentAge,
				inflationRate,
				useInflationAdjustedValues
			),
		[
			accounts,
			currentAge,
			targetAge,
			selfAnnualIncome,
			spouseAnnualIncome,
			selfIncomeGrowthRate,
			spouseIncomeGrowthRate,
			assetFinanceDetailsByAccountId,
			irsLimits,
			hasSpouse,
			spousePerson,
			inflationRate,
			useInflationAdjustedValues,
		]
	)
	const projectedNetWorthAtTargetAge = projectionRows.at(-1)?.totalBalance ?? totalStartingBalance
	const financialFreedomAge = useMemo(() => {
		const firstFreedomRow = projectionRows.find((row) => row.totalBalance >= financialFreedomTarget)
		return firstFreedomRow?.age ?? null
	}, [projectionRows, financialFreedomTarget])
	const accountBreakdownRows = useMemo(
		() =>
			accounts.map((account, index) => {
				const employeeMonthly = getEmployeeMonthlyContribution(account, selfAnnualIncome, spouseAnnualIncome)
				const annualEmployee = employeeMonthly * 12
				const ownerBirthday = people.find((person) => person.type === account.owner)?.birthday ?? selfPerson?.birthday ?? ''
				const ownerAge = getAgeFromBirthday(ownerBirthday)
				const suggestedLimit = getSuggestedAnnualLimit(account.accountType, ownerAge, irsLimits, hasSpouse)
				const exceedsLimit = suggestedLimit > 0 && plannerConstants.isMoneyGreaterThanWithTolerance(annualEmployee, suggestedLimit)
				const matchMonthly = getEmployerMatchMonthly(account, selfAnnualIncome, spouseAnnualIncome)
				const accountTypeLabel = accountTypeOptions.find((option) => option.value === account.accountType)?.label ?? 'Other'
				const ownerLabel = account.owner === 'spouse' ? 'Spouse' : 'Self'

				return {
					id: account.id,
					name: account.name,
					ownerLabel,
					accountTypeLabel,
					employeeMonthly,
					matchMonthly,
					totalMonthly: employeeMonthly + matchMonthly,
					annualEmployee,
					suggestedLimit,
					exceedsLimit,
					projectedValue: finalBalances[index] ?? 0,
				}
			}),
		[accounts, selfAnnualIncome, spouseAnnualIncome, people, selfPerson, irsLimits, hasSpouse, finalBalances]
	)

	const dynamicChartConfig = useMemo(() => {
		const accountEntries = Object.fromEntries(
			accounts.map((account, index) => [
				`account-${index}`,
				{
					label: account.name,
					color: accountLineColors[index % accountLineColors.length],
				},
			])
		)

		return {
			...plannerChartConfig,
			...accountEntries,
		} satisfies ChartConfig
	}, [accounts])

	const updateAccount = (id: string, updater: (account: PlannerAccount) => PlannerAccount) => {
		setAccounts((prev) => prev.map((account) => (account.id === id ? updater(account) : account)))
	}

	const addAccount = () => {
		setAccounts((prev) => [
			...prev,
			{
				id: crypto.randomUUID(),
				name: `Account ${prev.length + 1}`,
				...plannerConstants.PLANNER_DEFAULT_NEW_ACCOUNT,
				annualRate: weightedAnnualRate,
			},
		])
	}

	const addLiability = () => {
		const newId = crypto.randomUUID()
		const newAccount: PlannerAccount = {
			id: newId,
			name: `Liability ${accounts.length + 1}`,
			owner: 'self',
			accountType: 'student-loan',
			contributionMode: 'monthly',
			contributionValue: 500,
			employerMatchRate: 0,
			employerMatchMaxPercentOfSalary: 0,
			startingBalance: 25000,
			annualRate: 6,
		}

		setAccounts((prev) => [...prev, newAccount])
	}

	const updatePerson = (id: string, updater: (person: PlannerPerson) => PlannerPerson) => {
		setPeople((prev) => prev.map((person) => (person.id === id ? updater(person) : person)))
	}

	const addSpouse = () => {
		if (people.some((person) => person.type === 'spouse')) {
			return
		}

		setPeople((prev) => [
			...prev,
			{
				id: crypto.randomUUID(),
				...plannerConstants.PLANNER_DEFAULT_SPOUSE_PERSON,
			},
		])
	}

	const removeSpouse = () => {
		setPeople((prev) => prev.filter((person) => person.type !== 'spouse'))
		setAccounts((prev) => prev.map((account) => (account.owner === 'spouse' ? { ...account, owner: 'self' } : account)))
	}

	const removeAccount = (id: string) => {
		if (accounts.length === 1) {
			return
		}
		setAccounts((prev) => prev.filter((account) => account.id !== id))
		setAssetFinanceDetailsByAccountId((prev) => {
			if (!prev[id]) {
				return prev
			}

			const next = { ...prev }
			delete next[id]
			return next
		})
	}

	const maxOutAccount = (id: string) => {
		updateAccount(id, (current) => ({
			...current,
			contributionMode: 'monthly',
			contributionValue:
				getSuggestedAnnualLimit(
					current.accountType,
					getAgeFromBirthday((people.find((person) => person.type === current.owner) ?? selfPerson)?.birthday ?? ''),
					irsLimits,
					hasSpouse
				) > 0
					? Number(
							(
								getSuggestedAnnualLimit(
									current.accountType,
									getAgeFromBirthday((people.find((person) => person.type === current.owner) ?? selfPerson)?.birthday ?? ''),
									irsLimits,
									hasSpouse
								) / 12
							).toFixed(2)
						)
					: current.contributionValue,
		}))
	}

	const monthlyGapToGoal = totalPlannedMonthlyInvestment - monthlyNeededForDesiredTarget
	const isMonthlyGapPositive = plannerConstants.isMoneyGreaterThanOrEqualWithTolerance(monthlyGapToGoal, 0)
	const [collapsedSections, setCollapsedSections] = useState<Record<SectionKey, boolean>>({ ...plannerConstants.PLANNER_DEFAULT_COLLAPSED_SECTIONS })
	const [activeSection, setActiveSection] = useState<PlannerSection>('overview')
	const mortgageAccounts = useMemo(() => accounts.filter((account) => account.accountType === 'home'), [accounts])

	const toggleSection = (sectionKey: SectionKey) => {
		setCollapsedSections((prev) => ({ ...prev, [sectionKey]: !prev[sectionKey] }))
	}

	const renderCollapseToggle = (sectionKey: SectionKey) => (
		<Button type="button" variant="ghost" size="icon" onClick={() => toggleSection(sectionKey)}>
			{collapsedSections[sectionKey] ? <ChevronDown /> : <ChevronUp />}
		</Button>
	)

	const plannerPageContextValue = {
		sectionUi: {
			retirementInputs: {
				collapsed: collapsedSections.retirementInputs,
				toggleControl: renderCollapseToggle('retirementInputs'),
			},
			people: {
				collapsed: collapsedSections.people,
				toggleControl: renderCollapseToggle('people'),
			},
			accounts: {
				collapsed: collapsedSections.accounts,
				toggleControl: renderCollapseToggle('accounts'),
			},
			projectionChart: {
				collapsed: collapsedSections.projectionChart,
				toggleControl: renderCollapseToggle('projectionChart'),
			},
			summaryCards: {
				requiredMonthlyCollapsed: collapsedSections.requiredMonthly,
				requiredMonthlyToggleControl: renderCollapseToggle('requiredMonthly'),
				plannedMonthlyCollapsed: collapsedSections.plannedMonthly,
				plannedMonthlyToggleControl: renderCollapseToggle('plannedMonthly'),
				retirementNeedCollapsed: collapsedSections.retirementEstimateCard,
				retirementNeedToggleControl: renderCollapseToggle('retirementEstimateCard'),
			},
			projectionTables: {
				yearlyCollapsed: collapsedSections.yearlyProjection,
				yearlyToggleControl: renderCollapseToggle('yearlyProjection'),
				accountBreakdownCollapsed: collapsedSections.accountBreakdown,
				accountBreakdownToggleControl: renderCollapseToggle('accountBreakdown'),
			},
		},
		retirementInputsCard: {
			desiredInvestmentAmount,
			monthlyExpenses,
			inflationRate,
			safeWithdrawalRate,
			useInflationAdjustedValues,
			retirementMethod,
			retirementMethodOptions: plannerConstants.PLANNER_RETIREMENT_METHOD_OPTIONS,
			fireLifestyleIndex,
			fireLifestyleOptions: plannerConstants.PLANNER_FIRE_LIFESTYLE_OPTIONS,
			fireTargets,
			yearsToGoal,
			annualNeedAtRetirement,
			baseFinancialFreedomTarget,
			retirementHorizonYears,
			suggestedSafeWithdrawalRate,
			financialFreedomAge,
			incomeReplacementRate: plannerConstants.PLANNER_DEFAULT_INCOME_REPLACEMENT_RATE,
			projectedHouseholdIncomeAtRetirement,
			incomeReplacementAnnualNeed,
			incomeReplacementTarget,
			minimumSafeWithdrawalRate: plannerConstants.PLANNER_SAFE_WITHDRAWAL_RATE_MIN,
			isRefreshingExpenses,
			formatCurrency,
			onDesiredInvestmentAmountChange: setDesiredInvestmentAmount,
			onMonthlyExpensesChange: setMonthlyExpenses,
			onInflationRateChange: setInflationRate,
			onSafeWithdrawalRateChange: setSafeWithdrawalRate,
			onUseInflationAdjustedValuesChange: setUseInflationAdjustedValues,
			onRetirementMethodChange: setRetirementMethod,
			onFireLifestyleIndexChange: setFireLifestyleIndex,
			onRefreshMonthlyExpenses: refreshMonthlyExpenses,
		},
		peopleCard: {
			people,
			hasSpouse,
			currentAge,
			targetAge,
			bonusModeOptions: plannerConstants.PLANNER_BONUS_MODE_OPTIONS,
			updatePerson,
			removeSpouse,
			addSpouse,
		},
		accountsCard: {
			data: {
				accounts,
				people: people.map((person) => ({ type: person.type, birthday: person.birthday })),
				selfBirthday: selfPerson?.birthday ?? '',
				hasSpouse,
				isIrsAccountsLoading,
				isIrsAccountsError,
				assetFinanceDetailsByAccountId,
				totalPlannedMonthlyEmployee,
				totalPlannedMonthlyMatch,
				totalPlannedMonthlyInvestment,
				selfAnnualIncome,
				spouseAnnualIncome,
			},
			options: {
				accountOwnerOptions,
				accountRateProfileOptions,
				accountTypeOptions,
				contributionModeOptions,
				liabilityContributionModeOptions,
				homeGrowthProfileOptions,
				vehicleDepreciationProfileOptions,
				defaultHomeGrowthProfile: plannerConstants.PLANNER_DEFAULT_HOME_GROWTH_PROFILE as HomeGrowthProfile,
				defaultVehicleDepreciationProfile: plannerConstants.PLANNER_DEFAULT_VEHICLE_DEPRECIATION_PROFILE as VehicleDepreciationProfile,
				defaultHomeAppreciationRate: plannerConstants.PLANNER_DEFAULT_HOME_APPRECIATION_RATE,
				defaultVehicleDepreciationRate: plannerConstants.PLANNER_DEFAULT_VEHICLE_DEPRECIATION_RATE,
			},
			helpers: {
				formatCurrency,
				toIsoDate,
				clamp,
				isLiabilityAccountType,
				isCombinedAssetType,
				isNonContributingAccountType,
				isDepreciatingAssetType,
				isMoneyEqualWithinTolerance: plannerConstants.isMoneyEqualWithinTolerance,
				isMoneyGreaterThanWithTolerance: plannerConstants.isMoneyGreaterThanWithTolerance,
				getEmployeeMonthlyContribution,
				getEmployerMatchMonthly,
				getDisplayedRatePercent: (account: PlannerAccount) => getDisplayedRatePercent(account, inflationRate, useInflationAdjustedValues),
				getStoredAnnualRateFromInput: (account: PlannerAccount, value: number) =>
					getStoredAnnualRateFromInput(account, value, inflationRate, useInflationAdjustedValues),
				getAccountRateProfileFromAnnualRate: (annualRate: number) => {
					const tolerance = 0.0001
					const rates = plannerConstants.PLANNER_ACCOUNT_RATE_PROFILE_RATES
					const profileOrder: Array<Exclude<AccountRateProfile, 'custom'>> = ['none', 'money-market', 'bonds', 'stock-bond-mix', 'stocks']

					for (const profile of profileOrder) {
						const effectiveProfileRate = getEffectiveAnnualRatePercent(rates[profile], inflationRate, useInflationAdjustedValues)
						if (Math.abs(annualRate - effectiveProfileRate) <= tolerance) {
							return profile
						}
					}

					return 'custom'
				},
				getAccountAnnualRateFromProfile: (profile: AccountRateProfile, currentAnnualRate: number) =>
					getAccountAnnualRateFromProfile(profile, currentAnnualRate, inflationRate, useInflationAdjustedValues),
				getAgeFromBirthday,
				getSuggestedAnnualLimit: (accountType: PlannerTypes.AccountType, age: number, includeSpouse: boolean) =>
					getSuggestedAnnualLimit(accountType, age, irsLimits, includeSpouse),
				getAssetFinanceSnapshot,
				getHomeAnnualGrowthRate,
				getDefaultAssetFinanceDetails,
			},
			actions: {
				updateAccount,
				updateAssetFinanceDetails,
				setAssetFinanceDetailsByAccountId,
				removeAccount,
				maxOutAccount,
				addAccount,
				addLiability,
			},
		},
		summaryCards: {
			data: {
				monthlyNeededForDesiredTarget,
				requiredMonthlyTargetLabel: selectedRetirementMethodLabel,
				annualHouseholdIncome,
				currentSavingsRateEmployeePercent,
				currentSavingsRateTotalPercent,
				requiredSavingsRatePercent,
				savingsRateGapPercent,
				weightedAnnualRate: effectiveWeightedAnnualRate,
				yearsToGoal,
				monthlyGapToGoal,
				isMonthlyGapPositive,
				totalStartingBalance,
				totalAssets,
				totalLiabilities,
				targetAge,
				projectedNetWorthAtTargetAge,
				totalPlannedMonthlyInvestment,
				annualNeedAtRetirement,
				financialFreedomTarget,
				monthlyNeededForFreedomTarget,
			},
			helpers: { formatCurrency },
		},
		projectionChartCard: {
			currentAge,
			targetAge,
			chartConfig: dynamicChartConfig,
			projectionRows,
			accounts,
			accountLineColors,
			formatCurrency,
		},
		projectionTables: {
			data: { projectionRows, accountBreakdownRows, targetAge },
			helpers: { formatCurrency },
		},
	}

	return (
		<div className="min-h-screen w-full pb-12">
			<Navigation />
			<div className="max-w-6xl mx-auto px-4 pt-24 flex flex-col gap-6">
				<div>
					<h1 className="text-3xl font-bold">Net Worth + Retirement Planner</h1>
					<p className="text-muted-foreground mt-1">
						Track all account types in one place and compare your retirement target against your projected net worth.
					</p>
					{putPlannerMutation.isPending ? <p className="text-sm text-muted-foreground mt-2">Saving changes...</p> : null}
					{!hasPlannerSaveError && !putPlannerMutation.isPending && lastPlannerSavedAt ? (
						<p className="text-sm text-muted-foreground mt-2">
							Last saved at{' '}
							{lastPlannerSavedAt.toLocaleTimeString([], {
								hour: 'numeric',
								minute: '2-digit',
								second: '2-digit',
							})}
						</p>
					) : null}
					{hasPlannerSaveError ? (
						<p className="text-sm text-destructive mt-2">Changes failed to save. Please verify the API is running and try again.</p>
					) : null}
				</div>

				<PlannerPageProvider value={plannerPageContextValue}>
					<Tabs value={activeSection} onValueChange={(value) => setActiveSection(value as PlannerSection)}>
						<div className="overflow-x-auto pb-1">
							<TabsList className="inline-flex h-9 w-max min-w-full justify-start gap-1">
								<TabsTrigger value="overview">Overview</TabsTrigger>
								<TabsTrigger value="personal">Personal Info</TabsTrigger>
								<TabsTrigger value="accounts">Accounts</TabsTrigger>
								<TabsTrigger value="mortgage">Mortgage</TabsTrigger>
								<TabsTrigger value="settings">Settings</TabsTrigger>
							</TabsList>
						</div>

						<TabsContent value="overview" className="space-y-6">
							<RetirementInputsCard />

							<SummaryCards />

							<ProjectionChartCard />

							<ProjectionTables />
						</TabsContent>

						<TabsContent value="personal" className="space-y-6">
							<PeopleCard />
						</TabsContent>

						<TabsContent value="accounts" className="space-y-6">
							<AccountsCard />
						</TabsContent>

						<TabsContent value="mortgage" className="space-y-6">
							<Card>
								<CardHeader>
									<CardTitle>Mortgage Section</CardTitle>
									<CardDescription>Home loan focused inputs and tools are grouped here.</CardDescription>
								</CardHeader>
								<CardContent className="space-y-3">
									<p className="text-sm text-muted-foreground">Home accounts: {mortgageAccounts.length}</p>
									{mortgageAccounts.length > 0 ? (
										<div className="space-y-2 text-sm">
											{mortgageAccounts.map((account) => {
												const details = assetFinanceDetailsByAccountId[account.id]
												const currentLoanBalance = clamp(details?.currentLoanBalance ?? 0)
												return (
													<div key={account.id} className="rounded-md border p-3">
														<p className="font-medium">{account.name}</p>
														<p>Current value: {formatCurrency(clamp(details?.currentValue ?? account.startingBalance))}</p>
														<p>Loan balance: {formatCurrency(currentLoanBalance)}</p>
													</div>
												)
											})}
										</div>
									) : (
										<p className="text-sm text-muted-foreground">Add a Home account in the Accounts section to populate mortgage details.</p>
									)}
									<Button asChild>
										<Link to={ROUTE_URLS.mortgageTools}>Open Mortgage Tools</Link>
									</Button>
								</CardContent>
							</Card>
						</TabsContent>

						<TabsContent value="settings" className="space-y-6">
							<Card>
								<CardHeader>
									<CardTitle>Planner Settings</CardTitle>
									<CardDescription>Persisted preferences and assumptions used across planner calculations.</CardDescription>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="space-y-1">
										<Label>Return Display Mode</Label>
										<Select
											value={useInflationAdjustedValues ? 'real' : 'nominal'}
											onValueChange={(value) => setUseInflationAdjustedValues(value === 'real')}
										>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="nominal">Nominal Returns</SelectItem>
												<SelectItem value="real">Inflation-Adjusted (Real) Returns</SelectItem>
											</SelectContent>
										</Select>
									</div>
									<div className="space-y-1">
										<Label>Currency</Label>
										<Select value={currencyCode} onValueChange={setCurrencyCode}>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="USD">US Dollar (USD)</SelectItem>
												<SelectItem value="EUR">Euro (EUR)</SelectItem>
												<SelectItem value="GBP">British Pound (GBP)</SelectItem>
											</SelectContent>
										</Select>
									</div>
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
										<div className="space-y-1">
											<Label>Inflation Rate %</Label>
											<FormattedNumberInput value={inflationRate} onValueChange={setInflationRate} maxFractionDigits={2} />
										</div>
										<div className="space-y-1">
											<Label>Safe Withdrawal Rate %</Label>
											<FormattedNumberInput value={safeWithdrawalRate} onValueChange={setSafeWithdrawalRate} maxFractionDigits={2} />
										</div>
									</div>
								</CardContent>
							</Card>
						</TabsContent>
					</Tabs>
				</PlannerPageProvider>
			</div>
		</div>
	)
}
