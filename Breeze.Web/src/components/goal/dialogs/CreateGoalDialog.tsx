import { useUser } from '@clerk/clerk-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { BreezeFormDialog } from '@/components/dialog/BreezeFormDialog'
import { FormInputField } from '@/components/form/FormInputField'
import { Button } from '@/components/ui/button'
import { Goal, goalFormSchema } from '@/services/hooks/goal/goalServices'
import { usePostGoal } from '@/services/hooks/goal/usePostGoal'

type CreateGoalDialogProps = {
	refetchGoals: () => void
}

export const CreateGoalDialog = ({ refetchGoals }: CreateGoalDialogProps) => {
	const { user } = useUser()

	const form = useForm<Goal>({
		resolver: zodResolver(goalFormSchema),
		defaultValues: {
			userId: user?.id ?? '',
			description: '',
			isCompleted: false,
		},
	})

	const postGoalMutation = usePostGoal({
		onSettled: () => {
			refetchGoals()
		},
	})

	const onSubmit = (values: Goal) => {
		if (!user?.id) return

		postGoalMutation.mutate({
			goal: {
				userId: user.id,
				description: values.description,
				isCompleted: false,
			},
		})
	}

	const dialogTrigger = <Button className="w-fit self-center">Create Goal</Button>

	const inputFields = <FormInputField form={form} name="description" label="Goal Description" placeholder="Enter your goal" />

	return (
		<BreezeFormDialog
			dialogTrigger={dialogTrigger}
			title="Create Goal"
			itemType="Goal"
			description="Create a new goal. Click save when you’re done."
			form={form}
			onSubmit={onSubmit}
			inputFields={inputFields}
		/>
	)
}
