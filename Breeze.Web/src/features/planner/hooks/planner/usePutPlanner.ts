import { useCallback } from 'react'

import { useMutation } from '@tanstack/react-query'

import { PlannerUpsertRequest, usePlanner } from './plannerServices'

export const usePutPlanner = () => {
	const { upsertPlanner } = usePlanner()

	const mutationFn = useCallback((payload: PlannerUpsertRequest) => upsertPlanner(payload), [upsertPlanner])

	return useMutation({
		mutationFn,
	})
}
