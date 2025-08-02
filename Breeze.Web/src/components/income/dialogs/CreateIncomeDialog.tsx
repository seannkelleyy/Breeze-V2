import { useState } from 'react'

import { useUser } from '@clerk/clerk-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { FormInputField } from '@/components/form/FormInputField'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form } from '@/components/ui/form'
import { Income, incomeFormSchema } from '@/services/hooks/income/incomeServices'
import { usePostIncome } from '@/services/hooks/income/usePostIncome'
import { useBudgetContext } from '@/services/providers/BudgetProvider'

export const CreateIncomeDialog = () => {
	const [open, setOpen] = useState(false)
	const { user } = useUser()
	const { budget, refetchIncomes, refetchBudget } = useBudgetContext()

	const form = useForm<Income>({
		resolver: zodResolver(incomeFormSchema),
		defaultValues: {
			userId: user?.id ?? '',
			budgetId: budget?.id ?? -1,
			name: '',
			amount: 0,
			date: new Date().toISOString().split('T')[0],
		},
	})

	const postMutation = usePostIncome({
		onSettled: () => {
			refetchIncomes()
			refetchBudget()
			setOpen(false)
			form.reset()
		},
	})

	const onSubmit = (values: Income) => {
		if (!user?.id || !budget?.id) return

		console.log('Creating income:', values)
		postMutation.mutate({
			budgetId: budget.id,
			income: {
				...values,
				userId: user.id,
				budgetId: budget.id,
			},
		})
	}

	const handleOpenChange = (open: boolean) => {
		setOpen(open)
		form.reset()
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<Button onClick={() => setOpen(true)}>Add Income</Button>
			<DialogContent className="max-w-[95%] w-fit rounded-md">
				<DialogHeader>
					<DialogTitle>Create Income</DialogTitle>
					<DialogDescription>Add a new income entry.</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormInputField form={form} name="name" label="Name" placeholder="e.g., Paycheck" />
						<FormInputField form={form} name="amount" label="Amount" type="number" placeholder="0.00" />
						<FormInputField form={form} name="date" label="Date" type="date" placeholder="YYYY-MM-DD" />
						<DialogFooter>
							<Button type="submit" disabled={!form.formState.isValid || form.formState.isSubmitting}>
								{form.formState.isSubmitting ? 'Creating...' : 'Create Income'}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}
