import { useEffect } from 'react'

import { useUser } from '@clerk/clerk-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { BreezeFormDialog } from '@/components/dialog/BreezeFormDialog'
import { FormInputField } from '@/components/form/FormInputField'
import { Button } from '@/components/ui/button'
import { Income, incomeFormSchema } from '@/services/hooks/income/incomeServices'
import { usePostIncome } from '@/services/hooks/income/usePostIncome'
import { useBudgetContext } from '@/services/providers/BudgetProvider'

/**
 * Component for creating a new income.
 * @returns {JSX.Element} The CreateIncomeDialog component.
 */
export const CreateIncomeDialog = () => {
	const { user } = useUser()
	const { budget, refetchIncomes, refetchBudget } = useBudgetContext()

	const form = useForm<Income>({
		resolver: zodResolver(incomeFormSchema),
		mode: 'onChange',
		defaultValues: {
			userId: user?.id ?? '',
			budgetId: budget?.id ?? -1,
			name: '',
			amount: 0,
			date: new Date().toISOString().split('T')[0],
		},
	})

	useEffect(() => {
		if (budget?.id) {
			form.setValue('budgetId', budget.id)
		}
	}, [form, budget?.id])

	const postMutation = usePostIncome({
		onSettled: () => {
			refetchIncomes()
			refetchBudget()
		},
	})

	const onSubmit = (values: Income) => {
		if (!user?.id || !budget?.id) return
		postMutation.mutate({
			budgetId: budget.id,
			income: {
				...values,
				userId: user.id,
				budgetId: budget.id,
			},
		})
	}

	const dialogTrigger = <Button>Add Income</Button>

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
			title="Create Income"
			itemType="Income"
			description="Add a new income entry."
			form={form}
			onSubmit={onSubmit}
			inputFields={inputFields}
		/>
	)
}
