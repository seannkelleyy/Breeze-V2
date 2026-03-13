import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Expense, expenseFormSchema } from '@/features/budgeting/hooks/expense/expenseServices'
import { useDeleteExpense } from '@/features/budgeting/hooks/expense/useDeleteExpense'
import { usePatchExpense } from '@/features/budgeting/hooks/expense/usePatchExpense'
import { useBudgetContext } from '@/features/budgeting/providers'
import { useCurrentUser } from '@/shared/breezeAuthButton'
import { DeleteConfirmationDialog } from '@/shared/deleteConfirmation/DeleteConfirmationDialog'
import { BreezeFormDialog } from '@/shared/dialog/BreezeFormDialog'
import { FormInputField } from '@/shared/form/FormInputField'
import { FormSelectField } from '@/shared/form/FormSelectField'

type EditExpenseDialogProps = {
	existingExpense: Expense
	children?: React.ReactNode
}

/**
 * Dialog component for editing an existing expense.
 * @param {Expense} existingExpense - The expense to be edited.
 * @param {React.ReactNode} children - Optional trigger element for the dialog.
 * @returns {JSX.Element} The EditExpenseDialog component.
 */
export const EditExpenseDialog = ({ existingExpense, children }: EditExpenseDialogProps) => {
	const { userId } = useCurrentUser()
	const { budget, categories, refetchBudget, refetchCategories, refetchExpenses } = useBudgetContext()

	const form = useForm<Expense>({
		resolver: zodResolver(expenseFormSchema),
		defaultValues: {
			...existingExpense,
		},
	})

	const patchMutation = usePatchExpense({
		onSettled: () => {
			refetchBudget()
			refetchCategories()
			refetchExpenses()
		},
	})

	const deleteMutation = useDeleteExpense({
		onSettled: () => {
			refetchBudget()
			refetchCategories()
			refetchExpenses()
		},
	})

	const onSubmit = (values: Expense) => {
		if (!userId || !budget?.id) return

		patchMutation.mutate({
			budgetId: budget.id,
			expense: {
				...values,
				id: existingExpense.id,
				userId,
			},
		})
	}

	const dialogTrigger = <div className="hover:cursor-pointer">{children}</div>

	const inputFields = (
		<>
			<FormInputField form={form} name="name" label="Name" placeholder="e.g., Groceries" />
			<FormSelectField
				form={form}
				name="categoryId"
				label="Category"
				placeholder="Select a category"
				options={
					categories.map((c) => ({
						value: String(c.id),
						label: c.name,
					})) ?? []
				}
			/>
			<FormInputField form={form} name="amount" label="Amount" type="number" placeholder="0.00" />
			<FormInputField form={form} name="date" label="Date" type="date" placeholder="YYYY-MM-DD" />
		</>
	)

	return (
		<BreezeFormDialog
			dialogTrigger={dialogTrigger}
			title="Edit Expense"
			itemType="Expense"
			description="Make changes to your expense here. Click save when you're done."
			form={form}
			onSubmit={onSubmit}
			inputFields={inputFields}
			destructiveElements={
				<DeleteConfirmationDialog
					key={existingExpense.id}
					onDelete={() =>
						deleteMutation.mutate({
							budgetId: budget.id,
							expense: existingExpense,
						})
					}
					itemType="Expense"
					additionalText={`You are about to delete the expense: ${existingExpense.name}`}
				/>
			}
		/>
	)
}
