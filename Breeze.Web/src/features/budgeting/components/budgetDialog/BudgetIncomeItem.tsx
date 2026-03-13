import { UseFormReturn } from 'react-hook-form'

import { DeleteConfirmationDialog } from '@/shared/deleteConfirmation/DeleteConfirmationDialog'
import { FormInputField } from '@/shared/form/FormInputField'
import { BudgetFormData } from '@/features/budgeting/hooks/budget/budgetServices'

type BudgetIncomeItemProps = {
	index: number
	form: UseFormReturn<BudgetFormData>
	deleteIncome: (index: number) => void
}

/**
 * A component representing a single income item in the budget form.
 * @param {number} index - The index of the income item in the form array.
 * @param {UseFormReturn<BudgetFormData>} form - The react-hook-form instance managing the budget form.
 * @param {(index: number) => void} deleteIncome - Function to delete the income at the specified index.
 * @returns {JSX.Element} The rendered income item.
 */
export function BudgetIncomeItem({ index, form, deleteIncome }: BudgetIncomeItemProps) {
	return (
		<section className="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_auto] gap-2 items-start">
			<FormInputField form={form} name={`incomes.${index}.name`} label="Name" placeholder="Income" hideLabel />
			<FormInputField form={form} name={`incomes.${index}.amount`} label="Amount" type="number" placeholder="0" hideLabel />
			<FormInputField form={form} name={`incomes.${index}.date`} label="Date" type="date" hideLabel />
			<DeleteConfirmationDialog
				key={form.getValues().incomes[index].id}
				itemType="income"
				additionalText={`You are about to delete the income: ${form.getValues().incomes[index].name}`}
				onDelete={() => deleteIncome(index)}
			/>
		</section>
	)
}
