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
		<section className="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_auto] gap-2 items-start">
			<FormInputField form={form} name={`incomes.${index}.name`} label="Name" placeholder="Paycheck" hideLabel />
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
