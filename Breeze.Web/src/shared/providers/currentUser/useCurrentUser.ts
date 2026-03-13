import { useContext } from 'react'

import { CurrentUserContext } from './CurrentUserStore'

export const useCurrentUser = () => {
	const context = useContext(CurrentUserContext)
	if (!context) {
		throw new Error('useCurrentUser must be used within a CurrentUserProvider')
	}

	return context
}
