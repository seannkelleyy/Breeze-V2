import { useEffect, useMemo, useState } from 'react'

import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react'

import { usePlannerPageContext } from '@/features/planner/context'
import type * as PlannerTypes from '@/lib/planner/types'
import { FormattedNumberInput } from '@/shared/form/FormattedNumberInput'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'

type AccountOwner = PlannerTypes.AccountOwner
type AccountRateProfile = PlannerTypes.AccountRateProfile
type AccountType = PlannerTypes.AccountType
type AssetFinanceDetails = PlannerTypes.AssetFinanceDetails
type AssetFinanceSnapshot = PlannerTypes.AssetFinanceSnapshot
type ContributionMode = PlannerTypes.ContributionMode
type HomeGrowthProfile = PlannerTypes.HomeGrowthProfile
type PlannerAccount = PlannerTypes.PlannerAccount
type VehicleDepreciationProfile = PlannerTypes.VehicleDepreciationProfile

type PlannerAccountLike = PlannerAccount

type PlannerPersonLike = {
	type: 'self' | 'spouse'
	birthday: string
}

type AssetFinanceDetailsLike = AssetFinanceDetails

export type AccountsCardData = {
	accounts: PlannerAccountLike[]
	people: PlannerPersonLike[]
	selfBirthday: string
	hasSpouse: boolean
	isIrsAccountsLoading: boolean
	isIrsAccountsError: boolean
	assetFinanceDetailsByAccountId: Record<string, AssetFinanceDetailsLike>
	totalPlannedMonthlyEmployee: number
	totalPlannedMonthlyMatch: number
	totalPlannedMonthlyInvestment: number
	selfAnnualIncome: number
	spouseAnnualIncome: number
}

export type AccountsCardOptions = {
	accountOwnerOptions: ReadonlyArray<{ value: AccountOwner; label: string }>
	accountRateProfileOptions: ReadonlyArray<{ value: AccountRateProfile; label: string }>
	accountTypeOptions: ReadonlyArray<{ value: AccountType; label: string }>
	contributionModeOptions: ReadonlyArray<{ value: ContributionMode; label: string }>
	liabilityContributionModeOptions: ReadonlyArray<{ value: ContributionMode; label: string }>
	homeGrowthProfileOptions: ReadonlyArray<{ value: HomeGrowthProfile; label: string }>
	vehicleDepreciationProfileOptions: ReadonlyArray<{ value: VehicleDepreciationProfile; label: string }>
	defaultHomeGrowthProfile: HomeGrowthProfile
	defaultVehicleDepreciationProfile: VehicleDepreciationProfile
	defaultHomeAppreciationRate: number
	defaultVehicleDepreciationRate: number
}

export type AccountsCardHelpers = {
	formatCurrency: (value: number) => string
	toIsoDate: (date: Date) => string
	clamp: (value: number, min?: number) => number
	isLiabilityAccountType: (accountType: AccountType) => boolean
	isCombinedAssetType: (accountType: AccountType) => boolean
	isNonContributingAccountType: (accountType: AccountType) => boolean
	isDepreciatingAssetType: (accountType: AccountType) => boolean
	isMoneyEqualWithinTolerance: (leftAmount: number, rightAmount: number) => boolean
	isMoneyGreaterThanWithTolerance: (leftAmount: number, rightAmount: number) => boolean
	getEmployeeMonthlyContribution: (account: PlannerAccountLike, selfAnnualIncome: number, spouseAnnualIncome: number) => number
	getEmployerMatchMonthly: (account: PlannerAccountLike, selfAnnualIncome: number, spouseAnnualIncome: number) => number
	getDisplayedRatePercent: (account: PlannerAccountLike) => number
	getStoredAnnualRateFromInput: (account: PlannerAccountLike, value: number) => number
	getAccountRateProfileFromAnnualRate: (annualRate: number) => AccountRateProfile
	getAccountAnnualRateFromProfile: (profile: AccountRateProfile, currentAnnualRate: number) => number
	getAgeFromBirthday: (birthday: string) => number
	getSuggestedAnnualLimit: (accountType: AccountType, age: number, hasSpouse: boolean) => number
	getAssetFinanceSnapshot: (details: AssetFinanceDetailsLike, asOf: Date) => AssetFinanceSnapshot
	getHomeAnnualGrowthRate: (profile: HomeGrowthProfile | string | undefined, customAnnualRate: number) => number
	getDefaultAssetFinanceDetails: (account: PlannerAccountLike) => AssetFinanceDetailsLike
}

export type AccountsCardActions = {
	updateAccount: (id: string, updater: (account: PlannerAccountLike) => PlannerAccountLike) => void
	updateAssetFinanceDetails: (accountId: string, updater: (details: AssetFinanceDetailsLike) => AssetFinanceDetailsLike) => void
	setAssetFinanceDetailsByAccountId: (updater: (previous: Record<string, AssetFinanceDetailsLike>) => Record<string, AssetFinanceDetailsLike>) => void
	removeAccount: (id: string) => void
	maxOutAccount: (id: string) => void
	addAccount: () => void
	addLiability: () => void
}

export const AccountsCard = () => {
	const { accountsCard, sectionUi } = usePlannerPageContext()
	const { collapsed, toggleControl } = sectionUi.accounts
	const { data, options, helpers, actions } = accountsCard
	type AccountFilter = 'all' | 'assets' | 'liabilities' | 'tax-advantaged'
	const {
		accounts,
		people,
		selfBirthday,
		hasSpouse,
		isIrsAccountsLoading,
		isIrsAccountsError,
		assetFinanceDetailsByAccountId,
		totalPlannedMonthlyEmployee,
		totalPlannedMonthlyMatch,
		totalPlannedMonthlyInvestment,
		selfAnnualIncome,
		spouseAnnualIncome,
	} = data
	const {
		accountOwnerOptions,
		accountRateProfileOptions,
		accountTypeOptions,
		contributionModeOptions,
		liabilityContributionModeOptions,
		homeGrowthProfileOptions,
		vehicleDepreciationProfileOptions,
		defaultHomeGrowthProfile,
		defaultVehicleDepreciationProfile,
		defaultHomeAppreciationRate,
		defaultVehicleDepreciationRate,
	} = options
	const {
		formatCurrency,
		toIsoDate,
		clamp,
		isLiabilityAccountType,
		isCombinedAssetType,
		isNonContributingAccountType,
		isDepreciatingAssetType,
		isMoneyEqualWithinTolerance,
		isMoneyGreaterThanWithTolerance,
		getEmployeeMonthlyContribution,
		getEmployerMatchMonthly,
		getDisplayedRatePercent,
		getStoredAnnualRateFromInput,
		getAccountRateProfileFromAnnualRate,
		getAccountAnnualRateFromProfile,
		getAgeFromBirthday,
		getSuggestedAnnualLimit,
		getAssetFinanceSnapshot,
		getHomeAnnualGrowthRate,
		getDefaultAssetFinanceDetails,
	} = helpers
	const { updateAccount, updateAssetFinanceDetails, setAssetFinanceDetailsByAccountId, removeAccount, maxOutAccount, addAccount, addLiability } =
		actions
	const [collapsedAccountIds, setCollapsedAccountIds] = useState<Record<string, boolean>>({})
	const [accountFilter, setAccountFilter] = useState<AccountFilter>('all')

	useEffect(() => {
		setCollapsedAccountIds((previous) => {
			const next: Record<string, boolean> = {}
			for (const account of accounts) {
				next[account.id] = previous[account.id] ?? false
			}
			return next
		})
	}, [accounts])

	const toggleAccountCollapsed = (accountId: string) => {
		setCollapsedAccountIds((previous) => ({ ...previous, [accountId]: !previous[accountId] }))
	}

	const filteredAccounts = useMemo(() => {
		switch (accountFilter) {
			case 'assets':
				return accounts.filter((account) => !isLiabilityAccountType(account.accountType))
			case 'liabilities':
				return accounts.filter((account) => {
					if (isLiabilityAccountType(account.accountType)) {
						return true
					}

					if (!isCombinedAssetType(account.accountType)) {
						return false
					}

					return assetFinanceDetailsByAccountId[account.id]?.hasLoan ?? false
				})
			case 'tax-advantaged':
				return accounts.filter((account) => getSuggestedAnnualLimit(account.accountType, 40, hasSpouse) > 0)
			case 'all':
			default:
				return accounts
		}
	}, [accountFilter, accounts, assetFinanceDetailsByAccountId, getSuggestedAnnualLimit, hasSpouse, isCombinedAssetType, isLiabilityAccountType])

	return (
		<Card>
			<CardHeader className="flex flex-row items-start justify-between gap-2">
				<div>
					<CardTitle>Accounts</CardTitle>
					<CardDescription>
						Add investment and non-investment assets (home, vehicle, emergency fund, checking), contributions, and growth assumptions.
					</CardDescription>
				</div>
				{toggleControl}
			</CardHeader>
			{!collapsed ? (
				<CardContent className="flex flex-col gap-4">
					<div className="flex flex-wrap justify-between items-center gap-2">
						<p className="text-xs text-muted-foreground">IRS limits apply only to tax-advantaged account types.</p>
						{isIrsAccountsLoading ? <p className="text-xs text-muted-foreground">Loading latest IRS limits...</p> : null}
						{isIrsAccountsError ? <p className="text-xs text-destructive">Unable to load IRS limits. Using fallback defaults.</p> : null}
					</div>
					<div className="flex flex-wrap items-center gap-2">
						<Button type="button" variant={accountFilter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setAccountFilter('all')}>
							All
						</Button>
						<Button type="button" variant={accountFilter === 'assets' ? 'default' : 'outline'} size="sm" onClick={() => setAccountFilter('assets')}>
							Assets
						</Button>
						<Button
							type="button"
							variant={accountFilter === 'liabilities' ? 'default' : 'outline'}
							size="sm"
							onClick={() => setAccountFilter('liabilities')}
						>
							Liabilities + Loans
						</Button>
						<Button
							type="button"
							variant={accountFilter === 'tax-advantaged' ? 'default' : 'outline'}
							size="sm"
							onClick={() => setAccountFilter('tax-advantaged')}
						>
							Tax-Advantaged
						</Button>
					</div>
					<div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
						{filteredAccounts.map((account) => {
							const isLiability = isLiabilityAccountType(account.accountType)
							const isCombinedAsset = isCombinedAssetType(account.accountType)
							const isAccountCollapsed = collapsedAccountIds[account.id] ?? false
							const assetFinanceDetails = assetFinanceDetailsByAccountId[account.id]
							const assetFinanceSnapshot = isCombinedAsset && assetFinanceDetails ? getAssetFinanceSnapshot(assetFinanceDetails, new Date()) : null
							const hidesContributionInputs = !isLiability && isNonContributingAccountType(account.accountType)
							const usesDepreciationInput = isDepreciatingAssetType(account.accountType)
							const selectedRateProfile = getAccountRateProfileFromAnnualRate(getDisplayedRatePercent(account))
							const employeeMonthly = getEmployeeMonthlyContribution(account, selfAnnualIncome, spouseAnnualIncome)
							const employeeAnnual = employeeMonthly * 12
							const ownerAge = getAgeFromBirthday((people.find((person) => person.type === account.owner)?.birthday ?? selfBirthday) || '')
							const suggestedLimit = getSuggestedAnnualLimit(account.accountType, ownerAge, hasSpouse)
							const isUsingIrsMaxContribution = suggestedLimit > 0 && isMoneyEqualWithinTolerance(employeeAnnual, suggestedLimit)
							const modeOptions = isLiability ? liabilityContributionModeOptions : contributionModeOptions
							const contributionInputLabel =
								account.contributionMode === 'monthly'
									? isLiability
										? 'Monthly Payment'
										: 'Monthly Contribution'
									: account.contributionMode === 'yearly'
										? isLiability
											? 'Yearly Payment'
											: 'Yearly Contribution'
										: isLiability
											? 'Payment % of Salary'
											: 'Contribution % of Salary'

							return (
								<div key={account.id} className="border rounded-md p-3 space-y-3 h-fit">
									<div className="flex items-center justify-between gap-2">
										<div className="flex items-center gap-2">
											<p className="text-sm font-medium">{account.name}</p>
											<Badge variant={isLiability ? 'destructive' : 'secondary'}>{isLiability ? 'Liability' : 'Asset'}</Badge>
										</div>
										<div className="flex items-center gap-2">
											<Button type="button" variant="ghost" size="icon" onClick={() => toggleAccountCollapsed(account.id)}>
												{isAccountCollapsed ? <ChevronDown /> : <ChevronUp />}
											</Button>
											<Button variant="destructive" size="icon" onClick={() => removeAccount(account.id)} disabled={accounts.length === 1}>
												<Trash2 />
											</Button>
										</div>
									</div>
									<div
										className={`grid grid-cols-1 md:grid-cols-2 gap-3 items-end overflow-hidden transition-all duration-300 ${
											isAccountCollapsed ? 'max-h-0 opacity-0 pointer-events-none' : 'max-h-[2400px] opacity-100'
										}`}
									>
										<div className="space-y-2">
											<Label>Account Name</Label>
											<Input
												value={account.name}
												onChange={(event) => updateAccount(account.id, (current) => ({ ...current, name: event.target.value }))}
											/>
										</div>
										<div className="space-y-2">
											<Label>Owner</Label>
											<Select
												value={account.owner}
												onValueChange={(value) => updateAccount(account.id, (current) => ({ ...current, owner: value as AccountOwner }))}
											>
												<SelectTrigger>
													<SelectValue placeholder="Select owner" />
												</SelectTrigger>
												<SelectContent>
													{accountOwnerOptions.map((ownerOption) => (
														<SelectItem key={ownerOption.value} value={ownerOption.value}>
															{ownerOption.label}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>
										<div className="space-y-2">
											<Label>Account Type</Label>
											<Select
												value={account.accountType}
												onValueChange={(value) => {
													const selectedType = value as AccountType
													const selectedTypeIsNonContributing = isNonContributingAccountType(selectedType)
													const selectedTypeIsCombinedAsset = isCombinedAssetType(selectedType)
													updateAccount(account.id, (current) => ({
														...current,
														accountType: selectedType,
														annualRate:
															selectedType === 'vehicle'
																? current.accountType !== 'vehicle'
																	? -12
																	: -Math.abs(current.annualRate)
																: selectedType === 'home' && current.annualRate <= 0
																	? 4
																	: current.annualRate,
														contributionMode: selectedTypeIsNonContributing ? 'monthly' : current.contributionMode,
														contributionValue: selectedTypeIsNonContributing ? 0 : current.contributionValue,
														employerMatchRate: selectedType === '401k' ? current.employerMatchRate : 0,
														employerMatchMaxPercentOfSalary: selectedType === '401k' ? current.employerMatchMaxPercentOfSalary : 0,
													}))

													setAssetFinanceDetailsByAccountId((prev) => {
														const next = { ...prev }
														if (selectedTypeIsCombinedAsset) {
															if (!next[account.id]) {
																next[account.id] = getDefaultAssetFinanceDetails({ ...account, accountType: selectedType })
															}
														} else if (next[account.id]) {
															delete next[account.id]
														}
														return next
													})
												}}
											>
												<SelectTrigger>
													<SelectValue placeholder="Select type" />
												</SelectTrigger>
												<SelectContent>
													{accountTypeOptions.map((option) => (
														<SelectItem key={option.value} value={option.value}>
															{option.label}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>
										{!hidesContributionInputs ? (
											<>
												<div className="space-y-2">
													<Label>{isLiability ? 'Payment Type' : 'Contribution Type'}</Label>
													<Select
														value={account.contributionMode}
														onValueChange={(value) =>
															updateAccount(account.id, (current) => ({ ...current, contributionMode: value as ContributionMode }))
														}
													>
														<SelectTrigger>
															<SelectValue placeholder={isLiability ? 'Select payment type' : 'Select contribution type'} />
														</SelectTrigger>
														<SelectContent>
															{modeOptions.map((modeOption) => (
																<SelectItem key={modeOption.value} value={modeOption.value}>
																	{modeOption.label}
																</SelectItem>
															))}
														</SelectContent>
													</Select>
												</div>
												<div className="space-y-2">
													<div className="flex items-center justify-between gap-2">
														<Label>{contributionInputLabel}</Label>
														{!isLiability ? (
															<Button
																type="button"
																variant="outline"
																size="sm"
																onClick={() => maxOutAccount(account.id)}
																disabled={suggestedLimit <= 0}
															>
																Max It Out
															</Button>
														) : null}
													</div>
													<FormattedNumberInput
														value={account.contributionValue}
														onValueChange={(value) => updateAccount(account.id, (current) => ({ ...current, contributionValue: value }))}
														maxFractionDigits={2}
													/>
													{isUsingIrsMaxContribution ? <p className="text-xs text-success">Using IRS max contribution</p> : null}
												</div>
											</>
										) : null}
										{account.accountType === '401k' ? (
											<>
												<div className="space-y-2">
													<Label>401(k) Match % of Contribution</Label>
													<FormattedNumberInput
														value={account.employerMatchRate}
														onValueChange={(value) => updateAccount(account.id, (current) => ({ ...current, employerMatchRate: value }))}
														maxFractionDigits={2}
													/>
												</div>
												<div className="space-y-2">
													<Label>401(k) Match Up To % of Salary</Label>
													<FormattedNumberInput
														value={account.employerMatchMaxPercentOfSalary}
														onValueChange={(value) =>
															updateAccount(account.id, (current) => ({ ...current, employerMatchMaxPercentOfSalary: value }))
														}
														maxFractionDigits={2}
													/>
												</div>
											</>
										) : null}
										{!isCombinedAsset ? (
											<>
												<div className="space-y-2">
													<Label>{isLiability ? 'Current Balance Owed' : 'Starting Balance'}</Label>
													<FormattedNumberInput
														value={account.startingBalance}
														onValueChange={(value) => updateAccount(account.id, (current) => ({ ...current, startingBalance: value }))}
														maxFractionDigits={0}
													/>
												</div>
												<div className="space-y-2">
													<Label>{isLiability ? 'Interest Profile' : 'Return Profile'}</Label>
													<Select
														value={selectedRateProfile}
														onValueChange={(value) =>
															updateAccount(account.id, (current) => ({
																...current,
																annualRate: getStoredAnnualRateFromInput(
																	current,
																	getAccountAnnualRateFromProfile(value as AccountRateProfile, getDisplayedRatePercent(current))
																),
															}))
														}
													>
														<SelectTrigger>
															<SelectValue placeholder="Select rate profile" />
														</SelectTrigger>
														<SelectContent>
															{accountRateProfileOptions.map((option) => (
																<SelectItem key={option.value} value={option.value}>
																	{option.label}
																</SelectItem>
															))}
														</SelectContent>
													</Select>
													{selectedRateProfile === 'custom' ? (
														<div className="mt-2 space-y-2">
															<Label>{usesDepreciationInput ? 'Custom Depreciation %' : isLiability ? 'Custom Interest %' : 'Custom Return %'}</Label>
															<FormattedNumberInput
																value={getDisplayedRatePercent(account)}
																onValueChange={(value) =>
																	updateAccount(account.id, (current) => ({ ...current, annualRate: getStoredAnnualRateFromInput(current, value) }))
																}
																maxFractionDigits={2}
															/>
														</div>
													) : null}
												</div>
											</>
										) : (
											<>
												<div className="space-y-2">
													<Label>Purchase Date</Label>
													<Input
														type="date"
														value={assetFinanceDetails?.purchaseDate ?? toIsoDate(new Date())}
														onChange={(event) =>
															updateAssetFinanceDetails(account.id, (current) => ({ ...current, purchaseDate: event.target.value }))
														}
													/>
												</div>
												<div className="space-y-2">
													<Label>Purchase Price</Label>
													<FormattedNumberInput
														value={assetFinanceDetails?.purchasePrice ?? clamp(account.startingBalance)}
														onValueChange={(value) =>
															updateAssetFinanceDetails(account.id, (current) => ({ ...current, purchasePrice: clamp(value) }))
														}
														maxFractionDigits={0}
													/>
												</div>
												<div className="space-y-2">
													<Label>{account.accountType === 'home' ? 'Current Home Value' : 'Current Vehicle Value'}</Label>
													<FormattedNumberInput
														value={assetFinanceDetails?.currentValue ?? clamp(account.startingBalance)}
														onValueChange={(value) =>
															updateAssetFinanceDetails(account.id, (current) => ({ ...current, currentValue: clamp(value) }))
														}
														maxFractionDigits={0}
													/>
												</div>
												<div className="space-y-2">
													<Label>{account.accountType === 'home' ? 'Growth Model' : 'Depreciation Model'}</Label>
													{account.accountType === 'home' ? (
														<>
															<Select
																value={assetFinanceDetails?.homeGrowthProfile ?? defaultHomeGrowthProfile}
																onValueChange={(value) =>
																	updateAssetFinanceDetails(account.id, (current) => {
																		const profile = value as HomeGrowthProfile
																		const nextAnnualRate = getHomeAnnualGrowthRate(profile, current.annualChangeRate)
																		return {
																			...current,
																			homeGrowthProfile: profile,
																			annualChangeRate: nextAnnualRate,
																		}
																	})
																}
															>
																<SelectTrigger>
																	<SelectValue placeholder="Select growth model" />
																</SelectTrigger>
																<SelectContent>
																	{homeGrowthProfileOptions.map((option) => (
																		<SelectItem key={option.value} value={option.value}>
																			{option.label}
																		</SelectItem>
																	))}
																</SelectContent>
															</Select>
															{assetFinanceDetails?.homeGrowthProfile === 'custom' ? (
																<div className="mt-2">
																	<Label>Custom Appreciation %</Label>
																	<FormattedNumberInput
																		value={assetFinanceDetails?.annualChangeRate ?? defaultHomeAppreciationRate}
																		onValueChange={(value) =>
																			updateAssetFinanceDetails(account.id, (current) => ({ ...current, annualChangeRate: value }))
																		}
																		maxFractionDigits={2}
																	/>
																</div>
															) : null}
														</>
													) : (
														<>
															<Select
																value={assetFinanceDetails?.vehicleDepreciationProfile ?? defaultVehicleDepreciationProfile}
																onValueChange={(value) =>
																	updateAssetFinanceDetails(account.id, (current) => ({
																		...current,
																		vehicleDepreciationProfile: value as VehicleDepreciationProfile,
																	}))
																}
															>
																<SelectTrigger>
																	<SelectValue placeholder="Select depreciation model" />
																</SelectTrigger>
																<SelectContent>
																	{vehicleDepreciationProfileOptions.map((option) => (
																		<SelectItem key={option.value} value={option.value}>
																			{option.label}
																		</SelectItem>
																	))}
																</SelectContent>
															</Select>
															{assetFinanceDetails?.vehicleDepreciationProfile === 'custom' ? (
																<div className="mt-2">
																	<Label>Custom Depreciation %</Label>
																	<FormattedNumberInput
																		value={Math.abs(Math.min(0, assetFinanceDetails?.annualChangeRate ?? -defaultVehicleDepreciationRate))}
																		onValueChange={(value) =>
																			updateAssetFinanceDetails(account.id, (current) => ({ ...current, annualChangeRate: -clamp(value) }))
																		}
																		maxFractionDigits={2}
																	/>
																</div>
															) : null}
														</>
													)}
												</div>
												<div className="space-y-2">
													<Label>Still Have a Loan?</Label>
													<Select
														value={(assetFinanceDetails?.hasLoan ?? false) ? 'yes' : 'no'}
														onValueChange={(value) =>
															updateAssetFinanceDetails(account.id, (current) => ({
																...current,
																hasLoan: value === 'yes',
																originalLoanAmount:
																	value === 'yes' && clamp(current.originalLoanAmount) <= 0
																		? clamp(current.currentLoanBalance)
																		: current.originalLoanAmount,
															}))
														}
													>
														<SelectTrigger>
															<SelectValue placeholder="Select" />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="yes">Yes</SelectItem>
															<SelectItem value="no">No</SelectItem>
														</SelectContent>
													</Select>
												</div>
												{assetFinanceDetails?.hasLoan ? (
													<>
														<div className="space-y-2">
															<Label>Loan Interest Rate %</Label>
															<FormattedNumberInput
																value={assetFinanceDetails.loanInterestRate}
																onValueChange={(value) =>
																	updateAssetFinanceDetails(account.id, (current) => ({ ...current, loanInterestRate: value }))
																}
																maxFractionDigits={2}
															/>
														</div>
														<div className="space-y-2">
															<Label>Original Loan Amount</Label>
															<FormattedNumberInput
																value={assetFinanceDetails.originalLoanAmount}
																onValueChange={(value) =>
																	updateAssetFinanceDetails(account.id, (current) => ({ ...current, originalLoanAmount: clamp(value) }))
																}
																maxFractionDigits={0}
															/>
														</div>
														<div className="space-y-2">
															<Label>Principal + Interest Payment (Monthly)</Label>
															<FormattedNumberInput
																value={assetFinanceDetails.loanMonthlyPayment}
																onValueChange={(value) =>
																	updateAssetFinanceDetails(account.id, (current) => ({ ...current, loanMonthlyPayment: clamp(value) }))
																}
																maxFractionDigits={2}
															/>
														</div>
														<div className="space-y-2">
															<Label>Loan Term (Years)</Label>
															<FormattedNumberInput
																value={assetFinanceDetails.loanTermYears}
																onValueChange={(value) =>
																	updateAssetFinanceDetails(account.id, (current) => ({ ...current, loanTermYears: clamp(value) }))
																}
																maxFractionDigits={0}
															/>
														</div>
														<div className="space-y-2">
															<Label>Loan Start Date</Label>
															<Input
																type="date"
																value={assetFinanceDetails.loanStartDate}
																onChange={(event) =>
																	updateAssetFinanceDetails(account.id, (current) => ({ ...current, loanStartDate: event.target.value }))
																}
															/>
														</div>
														<div className="space-y-2">
															<Label>Current Loan Amount</Label>
															<FormattedNumberInput
																value={assetFinanceDetails.currentLoanBalance}
																onValueChange={(value) =>
																	updateAssetFinanceDetails(account.id, (current) => ({ ...current, currentLoanBalance: clamp(value) }))
																}
																maxFractionDigits={0}
															/>
														</div>
														{assetFinanceDetails.originalLoanAmount > 0 ? (
															<div className="md:col-span-2 rounded-md border p-2 text-xs text-muted-foreground">
																<p>
																	Principal paid to date:{' '}
																	{formatCurrency(Math.max(0, assetFinanceDetails.originalLoanAmount - assetFinanceDetails.currentLoanBalance))}
																</p>
																<p>
																	Loan paid off:{' '}
																	{(
																		(Math.max(0, assetFinanceDetails.originalLoanAmount - assetFinanceDetails.currentLoanBalance) /
																			assetFinanceDetails.originalLoanAmount) *
																		100
																	).toFixed(1)}
																	%
																</p>
															</div>
														) : null}
													</>
												) : null}
											</>
										)}
									</div>
									<div className="text-xs text-muted-foreground">
										{isAccountCollapsed ? (
											<p>
												{isLiability ? 'Payment' : 'Employee'}: {formatCurrency(employeeMonthly)}/mo
												{account.accountType === '401k'
													? `, Match: ${formatCurrency(getEmployerMatchMonthly(account, selfAnnualIncome, spouseAnnualIncome))}/mo`
													: ''}
												{assetFinanceSnapshot
													? `, Equity: ${formatCurrency(assetFinanceSnapshot.equity)}`
													: `, Balance: ${formatCurrency(account.startingBalance)}`}
											</p>
										) : null}
										{hidesContributionInputs ? (
											<p>
												{isCombinedAsset
													? 'This account combines asset value and optional loan in one place.'
													: 'This account type tracks value/depreciation only. Contribution inputs are hidden.'}
											</p>
										) : isLiability ? (
											<p>Liability payments are not IRS-limited.</p>
										) : (
											<>
												<p>
													IRS annual limit for age {ownerAge}: {formatCurrency(suggestedLimit)}
												</p>
												{suggestedLimit > 0 ? (
													<span className={isMoneyGreaterThanWithTolerance(employeeAnnual, suggestedLimit) ? 'text-destructive font-medium' : ''}>
														Annual contribution {formatCurrency(employeeAnnual)} / limit {formatCurrency(suggestedLimit)}
													</span>
												) : (
													<span>No annual limit set for this account.</span>
												)}
											</>
										)}
										{!hidesContributionInputs ? (
											<span className="ml-2">
												{isLiability ? 'Monthly payment' : 'Employee monthly equivalent'}: {formatCurrency(employeeMonthly)}
											</span>
										) : null}

										{assetFinanceSnapshot ? (
											<span className="ml-2">
												Estimated equity now: {formatCurrency(assetFinanceSnapshot.equity)} ({formatCurrency(assetFinanceSnapshot.assetValue)} - Loan{' '}
												{formatCurrency(assetFinanceSnapshot.loanBalance)})
											</span>
										) : null}
										{usesDepreciationInput ? (
											<span className="ml-2">
												Vehicle depreciation uses a tapered curve by age (faster early years, slower later years), unless Custom is selected.
											</span>
										) : null}
										{account.accountType === '401k' ? (
											<span className="ml-2">
												Employer match applied monthly: {formatCurrency(getEmployerMatchMonthly(account, selfAnnualIncome, spouseAnnualIncome))}
											</span>
										) : null}
									</div>
								</div>
							)
						})}
						{filteredAccounts.length === 0 ? (
							<div className="xl:col-span-2 border rounded-md p-4 text-sm text-muted-foreground">No accounts match this filter.</div>
						) : null}
					</div>
					<div className="flex justify-between items-center">
						<div className="text-sm text-muted-foreground">
							<p>Planned employee contribution / payment: {formatCurrency(totalPlannedMonthlyEmployee)}/month</p>
							<p>Planned employer match: {formatCurrency(totalPlannedMonthlyMatch)}/month</p>
							<p>Total planned contribution: {formatCurrency(totalPlannedMonthlyInvestment)}/month</p>
						</div>
						<div className="flex gap-2">
							<Button onClick={addAccount} variant="outline">
								<Plus /> Add Asset
							</Button>
							<Button onClick={addLiability} variant="outline">
								<Plus /> Add Liability
							</Button>
						</div>
					</div>
					<p className="text-xs text-muted-foreground">Annual limits are read from your IRS account configuration in the API.</p>
					<p className="text-xs text-muted-foreground">
						401(k) formula: Employer match = min(employee annual contribution, salary x match cap %) x match rate %.
					</p>
				</CardContent>
			) : null}
		</Card>
	)
}
