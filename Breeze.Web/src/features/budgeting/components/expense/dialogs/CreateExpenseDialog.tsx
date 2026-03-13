import { useEffect } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Expense, expenseFormSchema } from '@/features/budgeting/hooks/expense/expenseServices'
import { usePostExpense } from '@/features/budgeting/hooks/expense/usePostExpense'
import { useBudgetContext } from '@/features/budgeting/providers'
import { useCurrentUser } from '@/shared/breezeAuthButton'
import { BreezeFormDialog } from '@/shared/dialog/BreezeFormDialog'
import { FormInputField } from '@/shared/form/FormInputField'
import { FormSelectField } from '@/shared/form/FormSelectField'
import { Button } from '@/shared/ui/button'

/**
 * Component for adding a new expense.
 * @returns {JSX.Element} The CreateExpenseDialog component.
 */
export const CreateExpenseDialog = () => {
	const { userId } = useCurrentUser()
	const { budget, categories, refetchBudget, refetchCategories, refetchExpenses } = useBudgetContext()

	const form = useForm<Expense>({
		resolver: zodResolver(expenseFormSchema),
		defaultValues: {
			userId,
			categoryId: categories?.[0]?.id ?? 1,
			name: '',
			amount: 0,
			date: new Date().toISOString().split('T')[0],
		},
	})

	useEffect(() => {
		if (budget?.id) {
			form.setValue('categoryId', categories[0]?.id ?? 1)
		}
	}, [form, categories, budget?.id])

	const postMutation = usePostExpense({
		onSettled: () => {
			refetchBudget()
			refetchCategories()
			refetchExpenses()
		},
	})

	const onSubmit = (values: Expense) => {
		if (!userId || !budget?.id) return
		postMutation.mutate({
			budgetId: budget.id,
			expense: {
				...values,
				userId,
			},
		})
	}

	const dialogTrigger = <Button>Add Expense</Button>

	const inputFields = (
		<>
			<FormInputField form={form} name="name" label="Name" placeholder="e.g., Groceries" />
			<FormSelectField
				form={form}
				name="categoryId"
				label="Category"
				placeholder="Select a category"
				options={
					categories?.map((c) => ({
						value: String(c.id),
						label: c.name,
					})) ?? []
				}
			/>
			<FormInputField form={form} name="amount" label="Amount" type="number" placeholder="0.00" />
			<FormInputField form={form} name="date" label="Date" type="date" />
		</>
	)

	return (
		<BreezeFormDialog
			dialogTrigger={dialogTrigger}
			title="Create Expense"
			itemType="Expense"
			description="Add a new expense entry. Click save when you're done."
			form={form}
			onSubmit={onSubmit}
			inputFields={inputFields}
		/>
	)
}
