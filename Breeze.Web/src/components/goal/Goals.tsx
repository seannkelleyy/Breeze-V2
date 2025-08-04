import { useUser } from '@clerk/clerk-react'

import { Card } from '@/components/ui/card'
import { useFetchGoals } from '@/services/hooks/goal/useFetchGoals'

import { Loading } from '../loading/Loading'
import { CreateGoalDialog } from './dialogs/CreateGoalDialog'
import { EditGoalDialog } from './dialogs/EditGoalDialog'

export const Goals = () => {
	const { user } = useUser()
	const { data: goals, refetch, isLoading, isError } = useFetchGoals({ userId: user?.id ?? '' })

	if (goals) goals.sort((a, b) => (a.isCompleted === b.isCompleted ? 0 : a.isCompleted ? 1 : -1))

	return (
		<Card className="space-y-4 flex flex-col items-evenly p-4 my-4 w-[80%] max-w-[95%] md:max-w-[400px] rounded-md">
			<div className="flex justify-between items-center">
				<h1 className="text-2xl font-bold">Goals</h1>
			</div>
			<ul className="space-y-2">
				{goals ? (
					goals.map((goal) => (
						<EditGoalDialog existingGoal={goal} refetchGoals={refetch} key={goal.id}>
							<li className="flex gap-16 items-center justify-center mx-auto hover:bg-accent p-2 rounded-md" key={goal.id}>
								<p className="text-xl">{goal.isCompleted ? <del>{goal.description}</del> : goal.description}</p>
							</li>
						</EditGoalDialog>
					))
				) : isLoading ? (
					<li className="text-center">
						<Loading />
						Loading Goals...
					</li>
				) : isError ? (
					<li className="text-center">Error Loading Goals</li>
				) : (
					<li className="text-center">No goals found</li>
				)}
			</ul>
			<CreateGoalDialog refetchGoals={refetch} />
		</Card>
	)
}
