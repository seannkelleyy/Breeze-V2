import { useState } from 'react'

import { useUser } from '@clerk/clerk-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { FormInputField } from '@/components/form/FormInputField'
import { FormSelectField } from '@/components/form/FormSelectField'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form } from '@/components/ui/form'
import { Expense, expenseFormSchema } from '@/services/hooks/expense/expenseServices'
import { usePostExpense } from '@/services/hooks/expense/usePostExpense'
import { useBudgetContext } from '@/services/providers/BudgetProvider'

export const CreateExpenseDialog = () => {
	const [open, setOpen] = useState(false)
	const { user } = useUser()
	const { budget, categories, refetchCategories, refetchBudget, refetchExpenses } = useBudgetContext()

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

	const postMutation = usePostExpense({
		onSettled: () => {
			refetchBudget()
			refetchCategories()
			refetchExpenses()
			setOpen(false)
			form.reset()
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

	const handleOpenChange = (open: boolean) => {
		setOpen(open)
		form.reset()
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<Button onClick={() => setOpen(true)}>Add Expense</Button>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Create Expense</DialogTitle>
					<DialogDescription>Add a new expense entry. Click save when you're done.</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormInputField form={form} name="name" label="Name" />
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
						<FormInputField form={form} name="amount" label="Amount" type="number" />
						<FormInputField form={form} name="date" label="Date" type="date" />
						<DialogFooter>
							<Button type="submit" disabled={!form.formState.isValid || form.formState.isSubmitting}>
								{form.formState.isSubmitting ? 'Creating...' : 'Create Expense'}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}
