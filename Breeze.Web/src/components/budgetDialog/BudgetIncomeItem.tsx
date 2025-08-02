import { UseFormReturn } from 'react-hook-form'

import { DeleteConfirmationDialog } from '@/components/deleteConfirmation/DeleteConfirmationDialog'
import { FormInputField } from '@/components/form/FormInputField'
import { BudgetFormData } from '@/services/hooks/budget/budgetServices'

type BudgetIncomeItemProps = {
	index: number
	form: UseFormReturn<BudgetFormData>
	deleteIncome: (index: number) => void
}

export function BudgetIncomeItem({ index, form, deleteIncome }: BudgetIncomeItemProps) {
	return (
		<section className="flex gap-2 items-center">
			<FormInputField form={form} name={`incomes.${index}.name`} label="Name" placeholder="Paycheck" />
			<FormInputField form={form} name={`incomes.${index}.amount`} label="Amount" type="number" placeholder="0" />
			<FormInputField form={form} name={`incomes.${index}.date`} label="Date" type="date" />
			<DeleteConfirmationDialog
				itemType="income"
				additionalText={`You are about to delete the income: ${form.getValues().incomes[index].name}`}
				onDelete={() => deleteIncome(index)}
			/>
		</section>
	)
}
