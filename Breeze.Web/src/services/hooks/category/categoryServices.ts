import z from 'zod'

import useHttp from '../useHttp'

export interface Category {
	id?: number
	userId: string
	name: string
	budgetId: number
	currentSpend: number
	allocation: number
}

export const categoryFormSchema = z.object({
	id: z.number().optional(),
	userId: z.string().min(1, 'User ID is required'),
	name: z.string().min(1, 'Name is required'),
	budgetId: z.number(),
	currentSpend: z.number(),
	allocation: z.number().min(0.01, 'Allocation must be greater than 0'),
})

/**
 * A hook for fetching category data. This should only be used when creating new hooks with ReactQuery.
 */
export const useCategories = () => {
	const { getMany, post, patch, deleteOne } = useHttp()

	const getCategories = async (budgetId: number): Promise<Category[]> => await getMany<Category>(`budgets/${budgetId}/categories`)

	const postCategory = async (category: Category): Promise<number> => post<number, Category>(`budgets/${category.budgetId}/categories`, category)

	const patchCategory = async (category: Category): Promise<number> => patch<number, Category>(`budgets/${category.budgetId}/categories`, category)

	const deleteCategory = async (category: Category) => deleteOne<Category>(`budgets/${category.budgetId}/categories/${category.id}`)

	return { getCategories, postCategory, patchCategory, deleteCategory }
}
