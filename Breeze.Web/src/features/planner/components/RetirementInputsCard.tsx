import { usePlannerPageContext } from '@/features/planner/context'
import { useCurrentUser } from '@/shared/breezeAuthButton'
import { FormattedNumberInput } from '@/shared/form/FormattedNumberInput'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Checkbox } from '@/shared/ui/checkbox'
import { Label } from '@/shared/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'

type RetirementMethod = 'target-amount' | 'fire' | 'income-replacement'

export type RetirementInputsCardContextValue = {
	desiredInvestmentAmount: number
	monthlyExpenses: number
	inflationRate: number
	safeWithdrawalRate: number
	useInflationAdjustedValues: boolean
	retirementMethod: RetirementMethod
	retirementMethodOptions: ReadonlyArray<{ value: RetirementMethod; label: string }>
	fireLifestyleIndex: number
	fireLifestyleOptions: ReadonlyArray<{ label: string; multiplier: number }>
	fireTargets: ReadonlyArray<{ label: string; target: number; monthlySpendSupported: number }>
	yearsToGoal: number
	annualNeedAtRetirement: number
	baseFinancialFreedomTarget: number
	retirementHorizonYears: number
	suggestedSafeWithdrawalRate: number
	financialFreedomAge: number | null
	incomeReplacementRate: number
	projectedHouseholdIncomeAtRetirement: number
	incomeReplacementAnnualNeed: number
	incomeReplacementTarget: number
	minimumSafeWithdrawalRate: number
	isRefreshingExpenses: boolean
	formatCurrency: (value: number) => string
	onDesiredInvestmentAmountChange: (value: number) => void
	onMonthlyExpensesChange: (value: number) => void
	onInflationRateChange: (value: number) => void
	onSafeWithdrawalRateChange: (value: number) => void
	onUseInflationAdjustedValuesChange: (value: boolean) => void
	onRetirementMethodChange: (value: RetirementMethod) => void
	onFireLifestyleIndexChange: (value: number) => void
	onRefreshMonthlyExpenses: () => void
}

export const RetirementInputsCard = () => {
	const { retirementInputsCard, sectionUi } = usePlannerPageContext()
	const { collapsed, toggleControl } = sectionUi.retirementInputs
	const {
		desiredInvestmentAmount,
		monthlyExpenses,
		inflationRate,
		safeWithdrawalRate,
		useInflationAdjustedValues,
		retirementMethod,
		retirementMethodOptions,
		fireLifestyleIndex,
		fireLifestyleOptions,
		fireTargets,
		yearsToGoal,
		annualNeedAtRetirement,
		baseFinancialFreedomTarget,
		retirementHorizonYears,
		suggestedSafeWithdrawalRate,
		financialFreedomAge,
		incomeReplacementRate,
		projectedHouseholdIncomeAtRetirement,
		incomeReplacementAnnualNeed,
		incomeReplacementTarget,
		minimumSafeWithdrawalRate,
		isRefreshingExpenses,
		formatCurrency,
		onDesiredInvestmentAmountChange,
		onMonthlyExpensesChange,
		onInflationRateChange,
		onSafeWithdrawalRateChange,
		onUseInflationAdjustedValuesChange,
		onRetirementMethodChange,
		onFireLifestyleIndexChange,
		onRefreshMonthlyExpenses,
	} = retirementInputsCard
	const { isSignedIn } = useCurrentUser()
	const safeFireIndex = Math.max(0, Math.min(fireLifestyleIndex, fireLifestyleOptions.length - 1))
	const selectedFireLabel = fireLifestyleOptions[safeFireIndex]?.label ?? 'Standard FIRE'
	const selectedFireMultiplier = fireLifestyleOptions[safeFireIndex]?.multiplier ?? 1
	const selectedFireTarget = fireTargets[safeFireIndex]?.target ?? baseFinancialFreedomTarget
	const maxFireIndex = Math.max(0, fireLifestyleOptions.length - 1)

	return (
		<Card>
			<CardHeader className="flex flex-row items-start justify-between gap-2">
				<div>
					<CardTitle>Retirement Need Estimate</CardTitle>
					<CardDescription>Estimate yearly retirement spending and financial freedom target from expenses.</CardDescription>
				</div>
				{toggleControl}
			</CardHeader>
			{!collapsed ? (
				<CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div className="sm:col-span-2">
						<Tabs value={retirementMethod} onValueChange={(value) => onRetirementMethodChange(value as RetirementMethod)}>
							<TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 h-auto gap-1">
								{retirementMethodOptions.map((option) => (
									<TabsTrigger key={option.value} value={option.value}>
										{option.label}
									</TabsTrigger>
								))}
							</TabsList>

							<TabsContent value="target-amount" className="mt-4 space-y-4">
								<div className="space-y-2">
									<Label htmlFor="target-amount">Desired Investment Amount by Target Age</Label>
									<FormattedNumberInput
										id="target-amount"
										value={desiredInvestmentAmount}
										onValueChange={onDesiredInvestmentAmountChange}
										maxFractionDigits={0}
									/>
								</div>
							</TabsContent>

							<TabsContent value="fire" className="mt-4 space-y-4">
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									<div className="space-y-2">
										<div className="flex items-center justify-between gap-2">
											<Label htmlFor="monthly-expenses">Current Monthly Expenses</Label>
											<Button
												type="button"
												variant="outline"
												size="sm"
												onClick={onRefreshMonthlyExpenses}
												disabled={!isSignedIn || isRefreshingExpenses}
											>
												{isRefreshingExpenses ? 'Refreshing...' : 'Refresh'}
											</Button>
										</div>
										<FormattedNumberInput
											id="monthly-expenses"
											value={monthlyExpenses}
											onValueChange={onMonthlyExpensesChange}
											maxFractionDigits={0}
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="inflation-rate">Inflation Rate (%)</Label>
										<FormattedNumberInput id="inflation-rate" value={inflationRate} onValueChange={onInflationRateChange} maxFractionDigits={2} />
									</div>
									<div className="space-y-2 sm:col-span-2">
										<Label htmlFor="swr">Safe Withdrawal Rate (%)</Label>
										<FormattedNumberInput
											id="swr"
											value={safeWithdrawalRate}
											onValueChange={onSafeWithdrawalRateChange}
											min={minimumSafeWithdrawalRate}
											maxFractionDigits={2}
										/>
									</div>
								</div>
								<div className="space-y-2">
									<Label htmlFor="fire-lifestyle">FIRE Lifestyle: {selectedFireLabel}</Label>
									<input
										id="fire-lifestyle"
										type="range"
										min={0}
										max={maxFireIndex}
										step={1}
										value={safeFireIndex}
										onChange={(event) => onFireLifestyleIndexChange(Number(event.target.value))}
										className="w-full"
									/>
									<div className="flex justify-between text-xs text-muted-foreground">
										<span>{fireLifestyleOptions[0]?.label ?? 'Low'}</span>
										<span>{fireLifestyleOptions[maxFireIndex]?.label ?? 'High'}</span>
									</div>
								</div>
							</TabsContent>

							<TabsContent value="income-replacement" className="mt-4 space-y-4">
								<div className="space-y-2">
									<Label htmlFor="swr-income">Safe Withdrawal Rate (%)</Label>
									<FormattedNumberInput
										id="swr-income"
										value={safeWithdrawalRate}
										onValueChange={onSafeWithdrawalRateChange}
										min={minimumSafeWithdrawalRate}
										maxFractionDigits={2}
									/>
								</div>
								<div className="rounded-md border p-3 text-sm text-muted-foreground space-y-1">
									<p>Projected household income at retirement: {formatCurrency(projectedHouseholdIncomeAtRetirement)} / year</p>
									<p>Income replacement rate: {incomeReplacementRate.toFixed(0)}%</p>
									<p>Target annual spending: {formatCurrency(incomeReplacementAnnualNeed)} / year</p>
									<p>Income-replacement target: {formatCurrency(incomeReplacementTarget)}</p>
								</div>
							</TabsContent>
						</Tabs>
					</div>
					<div className="sm:col-span-2 flex items-start gap-2 rounded-md border p-3">
						<Checkbox
							id="inflation-mode"
							checked={useInflationAdjustedValues}
							onCheckedChange={(checked) => onUseInflationAdjustedValuesChange(Boolean(checked))}
						/>
						<div className="space-y-1">
							<Label htmlFor="inflation-mode" className="cursor-pointer">
								Use inflation-adjusted future dollars
							</Label>
							<p className="text-xs text-muted-foreground">
								On: targets shown in today's dollars (real terms). Off: targets shown in future nominal dollars.
							</p>
						</div>
					</div>
					{retirementMethod === 'fire' ? (
						<div className="sm:col-span-2 rounded-md border p-3">
							<p className="text-xs text-muted-foreground mb-2">FIRE target numbers at current assumptions:</p>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
								{fireTargets.map((target, index) => (
									<div key={target.label} className={index === safeFireIndex ? 'font-semibold text-accent' : ''}>
										{target.label}: {formatCurrency(target.target)} ({formatCurrency(target.monthlySpendSupported)}/mo spend)
									</div>
								))}
							</div>
							<div className="mt-3 rounded-md border p-3 text-xs text-muted-foreground space-y-1">
								<p>
									Suggested safe withdrawal for ~{retirementHorizonYears} retirement years: {suggestedSafeWithdrawalRate.toFixed(2)}%
								</p>
								<p>
									Financial freedom age (selected FIRE target): {financialFreedomAge !== null ? financialFreedomAge : 'Not reached by target age'}
								</p>
							</div>
							<div className="mt-3 border-t pt-3 text-xs text-muted-foreground space-y-1">
								<p className="font-medium text-foreground">How FIRE math is calculated</p>
								<p>
									1) {useInflationAdjustedValues ? 'Real-dollar annual spend' : 'Inflation-adjusted annual spend'} = (
									{formatCurrency(monthlyExpenses)} x 12)
									{!useInflationAdjustedValues ? ` x (1 + ${inflationRate.toFixed(2)}%)^${yearsToGoal}` : ''} ={' '}
									{formatCurrency(annualNeedAtRetirement)}
								</p>
								<p>
									2) Base FIRE target = {formatCurrency(annualNeedAtRetirement)} / ({safeWithdrawalRate.toFixed(2)}% / 100) ={' '}
									{formatCurrency(baseFinancialFreedomTarget)}
								</p>
								<p>
									3) {selectedFireLabel} target = {formatCurrency(baseFinancialFreedomTarget)} x {selectedFireMultiplier.toFixed(2)} ={' '}
									{formatCurrency(selectedFireTarget)}
								</p>
							</div>
						</div>
					) : null}
				</CardContent>
			) : null}
		</Card>
	)
}
