import z from 'zod'

import { Category, categoryFormSchema } from '../category/categoryServices'
import { Income, incomeFormSchema } from '../income/incomeServices'
import useHttp from '../useHttp'

export interface Budget {
	id: number
	userId: string
	monthlyIncome: number
	monthlyExpenses: number
	date: string
}

export const budgetFormSchema = z.object({
	incomes: z.array(incomeFormSchema),
	categories: z.array(categoryFormSchema),
})

export interface BudgetFormData {
	incomes: Income[]
	categories: Category[]
}

/**
 * A hook for fetching budget data. This should only be used when creating new hooks with ReactQuery.
 */
export const useBudgets = () => {
	const { getOne } = useHttp()

	const getBudget = async (year: number, month: number): Promise<Budget> => await getOne<Budget>(`budgets/${year}-${month}`)

	return { getBudget }
}
