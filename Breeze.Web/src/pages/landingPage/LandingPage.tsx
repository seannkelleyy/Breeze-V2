import { SignUpButton, useUser } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'

import AuthButton from '@/components/auth/AuthButton'
import { Button } from '@/components/ui/button'

export const LandingPage = () => {
	const { user, isSignedIn } = useUser()
	return (
		<section className="h-screen w-screen flex flex-col justify-center items-center">
			<div className="flex flex-col justify-center items-center gap-2 h-full">
				<h1 className="w-full text-left text-5xl font-medium">Breeze</h1>
				<p className="w-full text-center">Budgeting should be a</p>
				<p className="w-full text-right">
					<b>
						<span className="text-accent"> Breeze</span>
					</b>
					.
				</p>
				{isSignedIn ? (
					<div className="flex flex-col gap-2">
						<p className="w-full text-center">Welcome, {user.firstName}</p>
						<Link to="/">
							<Button>Go to Dashboard</Button>
						</Link>
					</div>
				) : (
					<div className="flex flex-col gap-2">
						<AuthButton />
						<p className="w-full text-center text-sm mt-4">Don't have an account?</p>
						<SignUpButton>
							<Button className="w-min self-center">Sign Up</Button>
						</SignUpButton>
					</div>
				)}
			</div>
		</section>
	)
}
