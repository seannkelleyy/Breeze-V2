import { useUser } from '@clerk/clerk-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { DeleteConfirmationDialog } from '@/components/deleteConfirmation/DeleteConfirmationDialog'
import { BreezeFormDialog } from '@/components/dialog/BreezeFormDialog'
import { FormInputField } from '@/components/form/FormInputField'
import { FormSelectField } from '@/components/form/FormSelectField'
import { Expense, expenseFormSchema } from '@/services/hooks/expense/expenseServices'
import { useDeleteExpense } from '@/services/hooks/expense/useDeleteExpense'
import { usePatchExpense } from '@/services/hooks/expense/usePatchExpense'
import { useBudgetContext } from '@/services/providers/BudgetProvider'

type EditExpenseDialogProps = {
	existingExpense: Expense
	children?: React.ReactNode
}

export const EditExpenseDialog = ({ existingExpense, children }: EditExpenseDialogProps) => {
	const { user } = useUser()
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
		if (!user?.id || !budget?.id) return

		patchMutation.mutate({
			budgetId: budget.id,
			expense: {
				...values,
				id: existingExpense.id,
				userId: user.id,
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
