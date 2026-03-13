import z from 'zod'

import useHttp from '@/shared/api/useHttp'

export interface Goal {
	id?: number
	userId: string
	description: string
	isCompleted: boolean
}

export const goalFormSchema = z.object({
	id: z.number().optional(),
	userId: z.string().min(1, 'User ID is required'),
	description: z.string().min(1, 'Description is required'),
	isCompleted: z.boolean(),
})

/**
 * A hook for fetching goal data. This should only be used when creating new hooks with ReactQuery.
 */
export const useGoals = () => {
	const { getMany, post, patch, deleteOne } = useHttp()

	const getGoals = async (userId: string): Promise<Goal[]> => await getMany<Goal>(`users/${userId}/goals`)

	const postGoal = async (goal: Goal): Promise<number> => post<number, Goal>(`users/${goal.userId}/goals`, goal)

	const patchGoal = async (goal: Goal): Promise<number> => patch<number, Goal>(`users/${goal.userId}/goals`, goal)

	const deleteGoal = async (goal: Goal) => deleteOne<Goal>(`users/${goal.userId}/goals/${goal.id}`)

	return { getGoals, postGoal, patchGoal, deleteGoal }
}
