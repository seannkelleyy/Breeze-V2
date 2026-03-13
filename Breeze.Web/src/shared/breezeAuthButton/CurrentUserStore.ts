import { createContext } from 'react'

import { useUser } from '@clerk/clerk-react'

export type ReturnDisplayMode = 'nominal' | 'real'

export type CurrentUserContextValue = {
	user: ReturnType<typeof useUser>['user']
	userId: string
	isLoaded: boolean
	isSignedIn: boolean
	currencyCode: string
	setCurrencyCode: (nextCurrencyCode: string) => void
	returnDisplayMode: ReturnDisplayMode
	setReturnDisplayMode: (nextReturnDisplayMode: ReturnDisplayMode) => void
}

export const CurrentUserContext = createContext<CurrentUserContextValue | null>(null)
