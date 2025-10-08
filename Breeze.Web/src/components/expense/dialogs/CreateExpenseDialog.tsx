import { useEffect } from 'react'

import { useUser } from '@clerk/clerk-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { BreezeFormDialog } from '@/components/dialog/BreezeFormDialog'
import { FormInputField } from '@/components/form/FormInputField'
import { FormSelectField } from '@/components/form/FormSelectField'
import { Button } from '@/components/ui/button'
import { Expense, expenseFormSchema } from '@/services/hooks/expense/expenseServices'
import { usePostExpense } from '@/services/hooks/expense/usePostExpense'
import { useBudgetContext } from '@/services/providers/BudgetProvider'

export const CreateExpenseDialog = () => {
	const { user } = useUser()
	const { budget, categories, refetchBudget, refetchCategories, refetchExpenses } = useBudgetContext()

	const form = useForm<Expense>({
		resolver: zodResolver(expenseFormSchema),
		defaultValues: {
			userId: user?.id ?? '',
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
	}, [form, categories])

	const postMutation = usePostExpense({
		onSettled: () => {
			refetchBudget()
			refetchCategories()
			refetchExpenses()
		},
	})

	const onSubmit = (values: Expense) => {
		if (!user?.id || !budget?.id) return
		postMutation.mutate({
			budgetId: budget.id,
			expense: {
				...values,
				userId: user.id,
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
