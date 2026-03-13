import { Badge } from '@/shared/ui/badge'
import { TabsContent } from '@/shared/ui/tabs'

type SwrSensitivityRow = {
	rate: number
	target: number
	freedomAge: number | null
}

type SwrSensitivityTabProps = {
	annualNeedAtRetirement: number
	safeWithdrawalRate: number
	swrSensitivityRows: SwrSensitivityRow[]
	formatCurrency: (value: number) => string
}

export const SwrSensitivityTab = ({ annualNeedAtRetirement, safeWithdrawalRate, swrSensitivityRows, formatCurrency }: SwrSensitivityTabProps) => {
	return (
		<TabsContent value="swr-sensitivity" className="space-y-3">
			<div className="rounded-md border p-3 text-sm space-y-1">
				<p>Annual spend target: {formatCurrency(annualNeedAtRetirement)}</p>
				<p>Current SWR: {safeWithdrawalRate.toFixed(2)}%</p>
			</div>
			<div className="max-h-72 overflow-auto rounded-md border">
				<table className="w-full text-xs">
					<thead className="sticky top-0 bg-muted">
						<tr>
							<th className="text-left p-2">SWR</th>
							<th className="text-right p-2">Target</th>
							<th className="text-right p-2">Freedom Age</th>
						</tr>
					</thead>
					<tbody>
						{swrSensitivityRows.map((row) => (
							<tr key={row.rate} className="border-t">
								<td className="p-2">
									<div className="flex items-center gap-2">
										{row.rate.toFixed(2)}%{Math.abs(row.rate - safeWithdrawalRate) < 0.13 ? <Badge variant="secondary">Current</Badge> : null}
									</div>
								</td>
								<td className="p-2 text-right">{formatCurrency(row.target)}</td>
								<td className="p-2 text-right">{row.freedomAge ?? 'Not reached'}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</TabsContent>
	)
}
