import type { FinancialMathSnapshot } from '@/lib/planner/types'
import { useCurrentUser } from '@/shared/breezeAuthButton'
import { CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'

import { formatCurrencyWithCode } from '../lib/plannerMath'
import { ExpensesEmergencyFundCard, IncomeSavingsCard } from './financialMathCards'

type FinancialMathCardProps = {
	snapshot: FinancialMathSnapshot
}

export const FinancialMathCard = ({ snapshot }: FinancialMathCardProps) => {
	const { currencyCode } = useCurrentUser()

	const formatCurrency = (value: number) => formatCurrencyWithCode(value, currencyCode)

	return (
		<div className="space-y-4">
			<CardHeader>
				<CardTitle>Emergency Fund + FI Math Snapshot</CardTitle>
				<CardDescription>This mirrors your Apple Notes formulas using your saved planner values, so it stays updated in one place.</CardDescription>
			</CardHeader>
			<div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
				<ExpensesEmergencyFundCard snapshot={snapshot} formatCurrency={formatCurrency} />
				<IncomeSavingsCard snapshot={snapshot} formatCurrency={formatCurrency} />
			</div>
		</div>
	)
}
