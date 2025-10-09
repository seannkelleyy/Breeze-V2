import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/clerk-react'

import { Button } from '../ui/button'

/**
 * A button component that displays a sign-in button when the user is signed out
 * and a user profile button when the user is signed in.
 * @returns {JSX.Element} The AuthButton component.
 */
export const AuthButton = () => {
	return (
		<>
			<SignedOut>
				<SignInButton>
					<Button>Sign In</Button>
				</SignInButton>
			</SignedOut>
			<SignedIn>
				<UserButton />
			</SignedIn>
		</>
	)
}
