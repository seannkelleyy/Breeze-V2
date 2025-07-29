export const Loading = () => {
	return (
		<div className="h-screen w-screen flex flex-col justify-center items-center">
			<div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-accent"></div>
			<p className="mt-4 text-lg">Loading...</p>
		</div>
	)
}
