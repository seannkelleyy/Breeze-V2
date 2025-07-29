import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/clerk-react'

import { Button } from '../ui/button'

export default function AuthButton() {
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
