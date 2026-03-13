import { type ReactNode, useMemo, useState } from 'react'

import { useUser } from '@clerk/clerk-react'

import { CurrentUserContext, type CurrentUserContextValue, type ReturnDisplayMode } from './CurrentUserStore'

type CurrentUserProviderProps = {
	children: ReactNode
}

export const CurrentUserProvider = ({ children }: CurrentUserProviderProps) => {
	const { user, isLoaded, isSignedIn } = useUser()
	const [currencyCode, setCurrencyCode] = useState('USD')
	const [returnDisplayMode, setReturnDisplayMode] = useState<ReturnDisplayMode>('nominal')

	const value = useMemo<CurrentUserContextValue>(
		() => ({
			user,
			userId: user?.id ?? '',
			isLoaded,
			isSignedIn: Boolean(isSignedIn),
			currencyCode,
			setCurrencyCode,
			returnDisplayMode,
			setReturnDisplayMode,
		}),
		[user, isLoaded, isSignedIn, currencyCode, returnDisplayMode]
	)

	return <CurrentUserContext.Provider value={value}>{children}</CurrentUserContext.Provider>
}
