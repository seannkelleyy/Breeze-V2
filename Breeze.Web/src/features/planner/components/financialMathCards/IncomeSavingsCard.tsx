import type { FinancialMathSnapshot } from '@/lib/planner/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'

type IncomeSavingsCardProps = {
	snapshot: FinancialMathSnapshot
	formatCurrency: (value: number) => string
}

export const IncomeSavingsCard = ({ snapshot, formatCurrency }: IncomeSavingsCardProps) => {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Income + Savings</CardTitle>
			</CardHeader>
			<CardContent className="space-y-1 text-sm">
				<p>Self salary: {formatCurrency(snapshot.selfSalary)}</p>
				<p>Spouse salary: {formatCurrency(snapshot.spouseSalary)}</p>
				<p>Gross income: {formatCurrency(snapshot.grossIncome)}</p>
				<p>
					Net income ({(snapshot.netIncomeFactor * 100).toFixed(0)}%): {formatCurrency(snapshot.netIncome)}
				</p>
				<p>Annual spend: {formatCurrency(snapshot.annualSpend)}</p>
				<p>Annual extra reserve: {formatCurrency(snapshot.annualExtraExpenseBuffer)}</p>
				<p>Yearly saving: {formatCurrency(snapshot.yearlySavings)}</p>
			</CardContent>
		</Card>
	)
}
