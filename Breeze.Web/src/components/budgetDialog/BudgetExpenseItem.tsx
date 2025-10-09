import { UseFormReturn } from 'react-hook-form'

import { DeleteConfirmationDialog } from '@/components/deleteConfirmation/DeleteConfirmationDialog'
import { FormInputField } from '@/components/form/FormInputField'
import { BudgetFormData } from '@/services/hooks/budget/budgetServices'

type BudgetExpenseItemProps = {
	index: number
	form: UseFormReturn<BudgetFormData>
	deleteCategory: (index: number) => void
}

/**
 * A component representing a single expense item in the budget form.
 * @param {number} index - The index of the expense item in the form array.
 * @param {UseFormReturn<BudgetFormData>} form - The react-hook-form instance managing the budget form.
 * @param {(index: number) => void} deleteCategory - Function to delete the category at the specified index.
 * @returns {JSX.Element} The rendered expense item.
 */
export function BudgetExpenseItem({ index, form, deleteCategory }: BudgetExpenseItemProps) {
	return (
		<section className="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)_auto] gap-2 items-start">
			<FormInputField form={form} name={`categories.${index}.name`} label="Name" placeholder="Expense" hideLabel />
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
