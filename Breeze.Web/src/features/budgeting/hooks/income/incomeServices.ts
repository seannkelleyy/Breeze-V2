import z from 'zod'

import useHttp from '@/shared/api/useHttp'

export interface Income {
	id?: number
	userId: string
	budgetId: number
	name: string
	amount: number
	date: string
	isRecurring?: boolean
	recurrenceInterval?: 'none' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly'
	paydayDayOfMonth?: number | null
	sourceType?: 'manual' | 'recurring-template'
	sourceTemplateId?: number | null
	sourceOccurrenceDate?: string | null
}

export const incomeFormSchema = z.object({
	id: z.number().optional(),
	userId: z.string().min(1, 'User ID is required'),
	budgetId: z.number().min(1, 'Budget ID is required'),
	name: z.string().min(1, 'Name is required'),
	amount: z.number().min(0.01, 'Amount must be greater than 0'),
	date: z.string().refine((val) => /^\d{4}-\d{2}-\d{2}$/.test(val), {
		message: 'Date must be in YYYY-MM-DD format',
	}),
	recurrenceInterval: z.enum(['none', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly']).optional().default('none'),
	paydayDayOfMonth: z.number().min(1).max(31).nullable().optional(),
})

/**
 * A hook for fetching income data. This should only be used when creating new hooks with ReactQuery.
 */
export const useIncomes = () => {
	const { getMany, post, patch, deleteOne } = useHttp()

	const getIncomes = async (budgetId: number): Promise<Income[]> => await getMany<Income>(`budgets/${budgetId}/incomes`)

	const postIncome = async (budgetId: number, income: Income): Promise<number> => await post<number, Income>(`budgets/${budgetId}/incomes`, income)

	const patchIncome = async (income: Income): Promise<number> => patch<number, Income>(`budgets/${income.budgetId}/incomes`, income)

	const deleteIncome = async (income: Income) => deleteOne<Income>(`budgets/${income.budgetId}/incomes/${income.id}`)

	return { getIncomes, postIncome, patchIncome, deleteIncome }
}
