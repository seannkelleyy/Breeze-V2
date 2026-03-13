import { FormattedNumberInput } from '@/shared/form/FormattedNumberInput'
import { Label } from '@/shared/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { TabsContent } from '@/shared/ui/tabs'

type StressResult = {
	monthlyIncomeLoss: number
	monthlyRateShock: number
	monthlyStressDrag: number
	stressedMonthlyInvestment: number
	isSolvent: boolean
	stressedFreedomAge: number | null
}

type StressTestTabProps = {
	data: {
		stressResult: StressResult
		monthlyNeededForDesiredTarget: number
		baseFreedomAge: number | null
	}
	state: {
		stressRateShockEnabled: boolean
		stressHomeShock: 'none' | 'flat' | 'down-10'
		stressIncomeDropPercent: number
		stressIncomeDropMonths: number
	}
	actions: {
		setStressRateShockEnabled: (enabled: boolean) => void
		setStressHomeShock: (value: 'none' | 'flat' | 'down-10') => void
		setStressIncomeDropPercent: (value: number) => void
		setStressIncomeDropMonths: (value: number) => void
	}
	helpers: {
		formatCurrency: (value: number) => string
	}
}

export const StressTestTab = ({ data, state, actions, helpers }: StressTestTabProps) => {
	const { stressResult, monthlyNeededForDesiredTarget, baseFreedomAge } = data
	const { stressRateShockEnabled, stressHomeShock, stressIncomeDropPercent, stressIncomeDropMonths } = state
	const { setStressRateShockEnabled, setStressHomeShock, setStressIncomeDropPercent, setStressIncomeDropMonths } = actions
	const { formatCurrency } = helpers

	return (
		<TabsContent value="stress-test" className="space-y-3">
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
				<div className="space-y-1">
					<Label>Rate Shock</Label>
					<Select value={stressRateShockEnabled ? 'on' : 'off'} onValueChange={(value) => setStressRateShockEnabled(value === 'on')}>
						<SelectTrigger>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="off">Off</SelectItem>
							<SelectItem value="on">+1% Mortgage Rate</SelectItem>
						</SelectContent>
					</Select>
				</div>
				<div className="space-y-1">
					<Label>Home Value Shock</Label>
					<Select value={stressHomeShock} onValueChange={(value) => setStressHomeShock(value as 'none' | 'flat' | 'down-10')}>
						<SelectTrigger>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="none">None</SelectItem>
							<SelectItem value="flat">Flat Home Price</SelectItem>
							<SelectItem value="down-10">-10% Home Price Shock</SelectItem>
						</SelectContent>
					</Select>
				</div>
				<div className="space-y-1">
					<Label>Income Drop %</Label>
					<FormattedNumberInput value={stressIncomeDropPercent} onValueChange={setStressIncomeDropPercent} maxFractionDigits={1} />
				</div>
				<div className="space-y-1">
					<Label>Income Drop Months</Label>
					<FormattedNumberInput value={stressIncomeDropMonths} onValueChange={setStressIncomeDropMonths} maxFractionDigits={0} />
				</div>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm rounded-md border p-3">
				<p>Monthly income drag: {formatCurrency(stressResult.monthlyIncomeLoss)}</p>
				<p>Housing payment drag: {formatCurrency(stressResult.monthlyRateShock)}</p>
				<p>Total monthly stress drag: {formatCurrency(stressResult.monthlyStressDrag)}</p>
				<p>
					Stress adjusted monthly investable: {formatCurrency(stressResult.stressedMonthlyInvestment)}
					{stressResult.stressedMonthlyInvestment >= monthlyNeededForDesiredTarget ? ' (still on track)' : ' (below required)'}
				</p>
				<p>Solvency check: {stressResult.isSolvent ? 'Positive monthly cushion' : 'Negative monthly cushion'}</p>
				<p>
					Freedom age impact: {baseFreedomAge ?? 'Not reached'} {'->'} {stressResult.stressedFreedomAge ?? 'Not reached'}
				</p>
			</div>
		</TabsContent>
	)
}
