import { useMemo } from 'react'

import type { IrsLimitConfig, IrsLimitKey } from '@/lib/planner/types'

import { clamp, defaultIrsLimits, getIrsLimitKeyFromApiType } from '../../lib/plannerMath'
import { useFetchIRSAccounts } from '../irsAccount'

export const useIrsLimits = () => {
	const { data: irsAccountData, isLoading: isIrsAccountsLoading, isError: isIrsAccountsError } = useFetchIRSAccounts()

	const irsLimits = useMemo<IrsLimitConfig>(() => {
		if (!irsAccountData || irsAccountData.length === 0) {
			return defaultIrsLimits
		}

		const nextLimits: IrsLimitConfig = { ...defaultIrsLimits }
		const hasType: Partial<Record<IrsLimitKey, boolean>> = {}

		for (const accountType of irsAccountData) {
			const mappedType = getIrsLimitKeyFromApiType(accountType.type)
			if (!mappedType) {
				continue
			}

			hasType[mappedType] = true
			nextLimits[mappedType] = {
				baseAnnualLimit: clamp(accountType.maxAmount),
				familyAnnualLimit: clamp(accountType.familyMaxAmount ?? 0),
				catchUpAmount: clamp(accountType.catchUpAmount),
				catchUpAge: clamp(accountType.catchUpAge),
			}
		}

		if (!hasType['403b'] && hasType['401k']) {
			nextLimits['403b'] = { ...nextLimits['401k'] }
		}

		if (!hasType['457'] && hasType['401k']) {
			nextLimits['457'] = { ...nextLimits['401k'] }
		}

		return nextLimits
	}, [irsAccountData])

	return {
		irsLimits,
		isIrsAccountsLoading,
		isIrsAccountsError,
	}
}
