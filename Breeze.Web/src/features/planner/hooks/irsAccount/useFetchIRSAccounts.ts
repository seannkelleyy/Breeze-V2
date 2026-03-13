import { useCallback } from 'react'

import { useQuery } from '@tanstack/react-query'

import { IRSAccount, useIRSAccounts } from './irsAccountServices'

export const useFetchIRSAccounts = () => {
	const { getIRSAccounts } = useIRSAccounts()

	const fetchIRSAccounts = useCallback(() => {
		return getIRSAccounts()
	}, [getIRSAccounts])

	return useQuery<IRSAccount[], Error>({
		queryKey: ['irs-accounts'],
		queryFn: fetchIRSAccounts,
		refetchInterval: 180 * 1000,
		retryDelay: 1 * 1000,
		retry: 3,
		enabled: true,
	})
}
