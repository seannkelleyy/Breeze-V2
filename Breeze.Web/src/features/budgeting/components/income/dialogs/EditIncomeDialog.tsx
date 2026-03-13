import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Income, incomeFormSchema } from '@/features/budgeting/hooks/income/incomeServices'
import { useDeleteIncome } from '@/features/budgeting/hooks/income/useDeleteIncome'
import { usePatchIncome } from '@/features/budgeting/hooks/income/usePatchIncome'
import { useBudgetContext } from '@/features/budgeting/providers'
import { useCurrentUser } from '@/shared/breezeAuthButton'
import { DeleteConfirmationDialog } from '@/shared/deleteConfirmation/DeleteConfirmationDialog'
import { BreezeFormDialog } from '@/shared/dialog/BreezeFormDialog'
import { FormInputField } from '@/shared/form/FormInputField'

type EditIncomeDialogProps = {
	existingIncome: Income
	children?: React.ReactNode
}

/**
 * Dialog component for editing an existing income.
 * @param {Income} existingIncome - The income to be edited.
 * @param {React.ReactNode} children - Optional trigger element for the dialog.
 * @returns {JSX.Element} The EditIncomeDialog component.
 */
export const EditIncomeDialog = ({ existingIncome, children }: EditIncomeDialogProps) => {
	const { userId } = useCurrentUser()
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
		if (!userId || !budget?.id) return

		patchMutation.mutate({
			income: {
				...values,
				id: existingIncome.id,
				userId,
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
