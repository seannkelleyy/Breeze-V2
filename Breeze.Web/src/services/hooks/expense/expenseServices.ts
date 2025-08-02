import z from 'zod'

import { Category } from '../category/categoryServices'
import useHttp from '../useHttp'

export interface Expense {
	id?: number
	userId: string
	categoryId: number
	name: string
	amount: number
	date: string
}

export const expenseFormSchema = z.object({
	id: z.number().optional(),
	userId: z.string().min(1, 'User ID is required'),
	name: z.string().min(1, { message: 'Name is required' }),
	categoryId: z.number().min(1, { message: 'Category is required' }),
	amount: z.number().min(0.01, 'Amount must be greater than 0'),
	date: z.string().refine((val) => /^\d{4}-\d{2}-\d{2}$/.test(val), { message: 'Invalid date format' }),
})

/**
 * A hook for fetching expense data. This should only be used when creating new hooks with ReactQuery.
 */
export const useExpenses = () => {
	const { getMany, post, patch, deleteOne } = useHttp()

	const getExpensesForCategory = async (category: Category): Promise<Expense[]> =>
		await getMany<Expense>(`budgets/${category.budgetId}/categories/${category.id}/expenses`)

	const getExpensesForBudget = async (budgetId: number): Promise<Expense[]> => await getMany<Expense>(`budgets/${budgetId}/expenses`)

	const postExpense = async (budgetId: number, expense: Expense): Promise<number> =>
		post<number, Expense>(`budgets/${budgetId}/categories/${expense.categoryId}/expenses`, expense)

	const patchExpense = async (budgetId: number, expense: Expense): Promise<number> =>
		patch<number, Expense>(`budgets/${budgetId}/categories/${expense.categoryId}/expenses`, expense)

	const deleteExpense = async (budgetId: number, expense: Expense) =>
		deleteOne<Expense>(`budgets/${budgetId}/categories/${expense.categoryId}/expenses/${expense.id}`)

	return { getExpensesForCategory, getExpensesForBudget, postExpense, patchExpense, deleteExpense }
}
