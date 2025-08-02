import { useState } from 'react'

import { useUser } from '@clerk/clerk-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { DeleteConfirmationDialog } from '@/components/deleteConfirmation/DeleteConfirmationDialog'
import { FormInputField } from '@/components/form/FormInputField'
import { FormSelectField } from '@/components/form/FormSelectField'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form } from '@/components/ui/form'
import { Expense, expenseFormSchema } from '@/services/hooks/expense/expenseServices'
import { useDeleteExpense } from '@/services/hooks/expense/useDeleteExpense'
import { usePatchExpense } from '@/services/hooks/expense/usePatchExpense'
import { useBudgetContext } from '@/services/providers/BudgetProvider'

type EditExpenseDialogProps = {
	existingExpense: Expense
	children?: React.ReactNode
}

export const EditExpenseDialog = ({ existingExpense, children }: EditExpenseDialogProps) => {
	const [open, setOpen] = useState(false)
	const { user } = useUser()
	const { budget, categories, refetchCategories, refetchBudget, refetchExpenses } = useBudgetContext()

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
			setOpen(false)
		},
	})

	const deleteMutation = useDeleteExpense({
		onSettled: () => {
			refetchBudget()
			refetchCategories()
			refetchExpenses()
			setOpen(false)
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

	const handleOpenChange = (open: boolean) => {
		setOpen(open)
		form.reset()
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger onClick={() => setOpen(true)} className="hover:cursor-pointer">
				<div>{children}</div>
			</DialogTrigger>
			<DialogContent className="max-w-[95%] w-fit rounded-md">
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<DialogHeader>
							<DialogTitle>Edit Expense</DialogTitle>
							<DialogDescription>Make changes to your expense here. Click save when you're done.</DialogDescription>
						</DialogHeader>
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
						<DialogFooter className="flex items-center">
							<DeleteConfirmationDialog
								onDelete={() =>
									deleteMutation.mutate({
										budgetId: budget.id,
										expense: existingExpense,
									})
								}
								itemType="Expense"
								additionalText={`You are about to delete the expense: ${existingExpense.name}`}
							/>
							<Button type="submit">Save Changes</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}
