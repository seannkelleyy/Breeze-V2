import { useUser } from '@clerk/clerk-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { DeleteConfirmationDialog } from '@/components/deleteConfirmation/DeleteConfirmationDialog'
import { BreezeFormDialog } from '@/components/dialog/BreezeFormDialog'
import { FormInputField } from '@/components/form/FormInputField'
import { Income, incomeFormSchema } from '@/services/hooks/income/incomeServices'
import { useDeleteIncome } from '@/services/hooks/income/useDeleteIncome'
import { usePatchIncome } from '@/services/hooks/income/usePatchIncome'
import { useBudgetContext } from '@/services/providers/BudgetProvider'

type EditIncomeDialogProps = {
	existingIncome: Income
	children?: React.ReactNode
}

export const EditIncomeDialog = ({ existingIncome, children }: EditIncomeDialogProps) => {
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
		},
	})

	const deleteMutation = useDeleteIncome({
		onSettled: () => {
			refetchBudget()
			refetchIncomes()
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

	const dialogTrigger = <div className="hover:cursor-pointer">{children}</div>

	const inputFields = (
		<>
			<FormInputField form={form} name="name" label="Name" placeholder="e.g., Paycheck" />
			<FormInputField form={form} name="amount" label="Amount" type="number" placeholder="0.00" />
			<FormInputField form={form} name="date" label="Date" type="date" placeholder="YYYY-MM-DD" />
		</>
	)

	return (
		<BreezeFormDialog
			dialogTrigger={dialogTrigger}
			title="Edit Income"
			itemType="Income"
			description="Make changes to your income here."
			form={form}
			onSubmit={onSubmit}
			inputFields={inputFields}
			destructiveElements={
				<DeleteConfirmationDialog
					key={existingIncome.id}
					onDelete={() => deleteMutation.mutate({ income: existingIncome })}
					additionalText={`You are about to delete the income: ${existingIncome.name}`}
					itemType="Income"
				/>
			}
		/>
	)
}
