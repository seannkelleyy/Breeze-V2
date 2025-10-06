import { UseFormReturn } from 'react-hook-form'

import { DeleteConfirmationDialog } from '@/components/deleteConfirmation/DeleteConfirmationDialog'
import { FormInputField } from '@/components/form/FormInputField'
import { BudgetFormData } from '@/services/hooks/budget/budgetServices'

type BudgetExpenseItemProps = {
	index: number
	form: UseFormReturn<BudgetFormData>
	deleteCategory: (index: number) => void
}

export function BudgetExpenseItem({ index, form, deleteCategory }: BudgetExpenseItemProps) {
	return (
		<section className="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)_auto] gap-2 items-start">
			<FormInputField form={form} name={`categories.${index}.name`} label="Name" placeholder="Groceries" hideLabel />
			<FormInputField form={form} name={`categories.${index}.allocation`} label="Allocation" type="number" placeholder="0" hideLabel />
			<DeleteConfirmationDialog
				key={form.getValues().categories[index].id}
				itemType="expense category"
				additionalText={
					<>
						<p>Deleting this category will remove all expenses associated with it.</p>
						<p>Are you sure you want to delete this category?</p>
					</>
				}
				onDelete={() => deleteCategory(index)}
			/>
		</section>
	)
}
