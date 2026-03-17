import { clamp } from '@/features/planner/lib/plannerMath'
import type { AssetFinanceDetails, VehicleDepreciationProfile } from '@/lib/planner/types'
import { FormattedNumberInput } from '@/shared/form/FormattedNumberInput'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'

type Option<T extends string> = { value: T; label: string }

type VehicleAccountFieldsProps = {
	assetFinanceDetails: AssetFinanceDetails | undefined
	defaultVehicleDepreciationProfile: string
	defaultVehicleDepreciationRate: number
	vehicleDepreciationProfileOptions: ReadonlyArray<Option<string>>
	onUpdateAssetFinanceDetails: (updater: (current: AssetFinanceDetails) => AssetFinanceDetails) => void
	toIsoDate: (value: Date) => string
}

export const VehicleAccountFields = ({
	assetFinanceDetails,
	defaultVehicleDepreciationProfile,
	defaultVehicleDepreciationRate,
	vehicleDepreciationProfileOptions,
	onUpdateAssetFinanceDetails,
	toIsoDate,
}: VehicleAccountFieldsProps) => {
	return (
		<>
			<div className="space-y-2">
				<Label>Purchase Date</Label>
				<Input
					type="date"
					value={assetFinanceDetails?.purchaseDate ?? toIsoDate(new Date())}
					onChange={(event) => onUpdateAssetFinanceDetails((current) => ({ ...current, purchaseDate: event.target.value }))}
				/>
			</div>
			<div className="space-y-2">
				<Label>Purchase Price</Label>
				<FormattedNumberInput
					value={assetFinanceDetails?.purchasePrice ?? 0}
					onValueChange={(value) => onUpdateAssetFinanceDetails((current) => ({ ...current, purchasePrice: value }))}
					maxFractionDigits={0}
				/>
			</div>
			<div className="space-y-2">
				<Label>Current Vehicle Value</Label>
				<FormattedNumberInput
					value={assetFinanceDetails?.currentValue ?? 0}
					onValueChange={(value) => onUpdateAssetFinanceDetails((current) => ({ ...current, currentValue: value }))}
					maxFractionDigits={0}
				/>
			</div>
			<div className="space-y-2">
				<Label>Depreciation Model</Label>
				<Select
					value={assetFinanceDetails?.vehicleDepreciationProfile ?? defaultVehicleDepreciationProfile}
					onValueChange={(value) =>
						onUpdateAssetFinanceDetails((current) => ({ ...current, vehicleDepreciationProfile: value as VehicleDepreciationProfile }))
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
							onValueChange={(value) => onUpdateAssetFinanceDetails((current) => ({ ...current, annualChangeRate: -clamp(value) }))}
							maxFractionDigits={2}
						/>
					</div>
				) : null}
			</div>
		</>
	)
}
