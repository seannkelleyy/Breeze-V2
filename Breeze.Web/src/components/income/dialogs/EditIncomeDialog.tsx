import { useState } from 'react'

import { useUser } from '@clerk/clerk-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { DeleteConfirmationDialog } from '@/components/deleteConfirmation/DeleteConfirmationDialog'
import { FormInputField } from '@/components/form/FormInputField'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form } from '@/components/ui/form'
import { Income, incomeFormSchema } from '@/services/hooks/income/incomeServices'
import { useDeleteIncome } from '@/services/hooks/income/useDeleteIncome'
import { usePatchIncome } from '@/services/hooks/income/usePatchIncome'
import { useBudgetContext } from '@/services/providers/BudgetProvider'

type EditIncomeDialogProps = {
	existingIncome: Income
	children?: React.ReactNode
}

export const EditIncomeDialog = ({ existingIncome, children }: EditIncomeDialogProps) => {
	const [open, setOpen] = useState<boolean>(false)
	const { user } = useUser()
	const { budget, refetchIncomes, refetchBudget } = useBudgetContext()

	const form = useForm<Income>({
		resolver: zodResolver(incomeFormSchema),
		defaultValues: {
			...existingIncome,
		},
	})

	const patchMutation = usePatchIncome({
		onSettled: () => {
			refetchBudget()
			refetchIncomes()
			setOpen(false)
		},
	})

	const deleteMutation = useDeleteIncome({
		onSettled: () => {
			refetchBudget()
			refetchIncomes()
			setOpen(false)
		},
	})

	const onSubmit = (values: Income) => {
		if (!user?.id || !budget?.id) return

		patchMutation.mutate({
			income: {
				...values,
				id: existingIncome.id,
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
			<DialogTrigger asChild>
				<div onClick={() => setOpen(true)} className="hover:cursor-pointer">
					{children}
				</div>
			</DialogTrigger>
			<DialogContent className="max-w-[95%] w-fit rounded-md">
				<DialogHeader>
					<DialogTitle>Edit Income</DialogTitle>
					<DialogDescription>Make changes to your income here.</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormInputField form={form} name="name" label="Name" placeholder="e.g., Paycheck" />
						<FormInputField form={form} name="amount" label="Amount" type="number" placeholder="0.00" />
						<FormInputField form={form} name="date" label="Date" type="date" placeholder="YYYY-MM-DD" />
						<DialogFooter className="flex items-center justify-between pt-4">
							<DeleteConfirmationDialog
								onDelete={() => deleteMutation.mutate({ income: existingIncome })}
								additionalText={`You are about to delete the income: ${existingIncome.name}`}
								itemType="Income"
							/>
							<Button type="submit" disabled={form.formState.isSubmitting}>
								Save Changes
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}
