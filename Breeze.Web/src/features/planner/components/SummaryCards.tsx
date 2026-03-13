import { usePlannerPageContext } from '@/features/planner/context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'

export type SummaryCardsContextValue = {
	data: {
		monthlyNeededForDesiredTarget: number
		requiredMonthlyTargetLabel: string
		annualHouseholdIncome: number
		currentSavingsRateEmployeePercent: number
		currentSavingsRateTotalPercent: number
		requiredSavingsRatePercent: number
		savingsRateGapPercent: number
		weightedAnnualRate: number
		yearsToGoal: number
		monthlyGapToGoal: number
		isMonthlyGapPositive: boolean
		totalStartingBalance: number
		totalAssets: number
		totalLiabilities: number
		targetAge: number
		projectedNetWorthAtTargetAge: number
		totalPlannedMonthlyInvestment: number
		annualNeedAtRetirement: number
		financialFreedomTarget: number
		monthlyNeededForFreedomTarget: number
	}
	helpers: {
		formatCurrency: (value: number) => string
	}
}

export const SummaryCards = () => {
	const { summaryCards, sectionUi } = usePlannerPageContext()
	const sections = sectionUi.summaryCards
	const { data, helpers } = summaryCards
	const {
		requiredMonthlyCollapsed,
		requiredMonthlyToggleControl,
		plannedMonthlyCollapsed,
		plannedMonthlyToggleControl,
		retirementNeedCollapsed,
		retirementNeedToggleControl,
	} = sections
	const {
		monthlyNeededForDesiredTarget,
		requiredMonthlyTargetLabel,
		annualHouseholdIncome,
		currentSavingsRateEmployeePercent,
		currentSavingsRateTotalPercent,
		requiredSavingsRatePercent,
		savingsRateGapPercent,
		weightedAnnualRate,
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
	} = data
	const { formatCurrency } = helpers

	return (
		<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
			<Card>
				<CardHeader className="flex flex-row items-start justify-between gap-2">
					<div>
						<CardTitle>Required Monthly Contribution</CardTitle>
						<CardDescription>Monthly amount needed to hit your target by retirement age.</CardDescription>
					</div>
					{requiredMonthlyToggleControl}
				</CardHeader>
				{!requiredMonthlyCollapsed ? (
					<CardContent>
						<p className="text-3xl font-bold text-accent">{formatCurrency(monthlyNeededForDesiredTarget)}</p>
						<p className="text-sm text-muted-foreground mt-2">Based on: {requiredMonthlyTargetLabel}</p>
						<p className="text-sm text-muted-foreground mt-1">Annual household income: {formatCurrency(annualHouseholdIncome)}</p>
						<p className="text-sm text-muted-foreground mt-2">
							Using weighted annual return of {weightedAnnualRate.toFixed(2)}% over {yearsToGoal} years.
						</p>
						<p className="text-sm text-muted-foreground mt-1">Current employee savings rate: {currentSavingsRateEmployeePercent.toFixed(1)}%</p>
						<p className="text-sm text-muted-foreground mt-1">
							Current total savings rate (employee + match): {currentSavingsRateTotalPercent.toFixed(1)}%
						</p>
						<p className="text-sm text-muted-foreground mt-1">Required savings rate: {requiredSavingsRatePercent.toFixed(1)}%</p>
						<p className={savingsRateGapPercent >= 0 ? 'text-sm text-success mt-1' : 'text-sm text-destructive mt-1'}>
							Savings rate gap: {savingsRateGapPercent >= 0 ? '+' : ''}
							{savingsRateGapPercent.toFixed(1)}%
						</p>
						<p className={isMonthlyGapPositive ? 'text-sm text-success mt-1' : 'text-sm text-destructive mt-1'}>
							Planned total is {formatCurrency(Math.abs(monthlyGapToGoal))}/month {isMonthlyGapPositive ? 'above' : 'below'} required.
						</p>
					</CardContent>
				) : null}
			</Card>
			<Card>
				<CardHeader className="flex flex-row items-start justify-between gap-2">
					<div>
						<CardTitle>Net Worth Snapshot</CardTitle>
						<CardDescription>Current and projected net worth across all accounts.</CardDescription>
					</div>
					{plannedMonthlyToggleControl}
				</CardHeader>
				{!plannedMonthlyCollapsed ? (
					<CardContent>
						<p className="text-3xl font-bold">{formatCurrency(totalStartingBalance)}</p>
						<p className="text-sm text-muted-foreground mt-2">Total assets: {formatCurrency(totalAssets)}.</p>
						<p className="text-sm text-muted-foreground mt-1">Total liabilities: {formatCurrency(totalLiabilities)}.</p>
						<p className="text-sm text-muted-foreground mt-2">
							Projected net worth at age {targetAge}: {formatCurrency(projectedNetWorthAtTargetAge)}.
						</p>
						<p className="text-sm text-muted-foreground mt-1">
							Planned monthly contribution across all assets: {formatCurrency(totalPlannedMonthlyInvestment)}.
						</p>
					</CardContent>
				) : null}
			</Card>
			<Card>
				<CardHeader className="flex flex-row items-start justify-between gap-2">
					<div>
						<CardTitle>Retirement Need Estimate</CardTitle>
						<CardDescription>Inflation-adjusted spending and freedom target.</CardDescription>
					</div>
					{retirementNeedToggleControl}
				</CardHeader>
				{!retirementNeedCollapsed ? (
					<CardContent>
						<p className="text-3xl font-bold">{formatCurrency(annualNeedAtRetirement)}</p>
						<p className="text-sm text-muted-foreground mt-2">Freedom target: {formatCurrency(financialFreedomTarget)}.</p>
						<p className="text-sm text-muted-foreground mt-1">Monthly needed for freedom target: {formatCurrency(monthlyNeededForFreedomTarget)}.</p>
					</CardContent>
				) : null}
			</Card>
		</div>
	)
}
