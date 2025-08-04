import { useUser } from '@clerk/clerk-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { DeleteConfirmationDialog } from '@/components/deleteConfirmation/DeleteConfirmationDialog'
import { BreezeFormDialog } from '@/components/dialog/BreezeFormDialog'
import { FormInputField } from '@/components/form/FormInputField'
import { Button } from '@/components/ui/button'
import { Goal, goalFormSchema } from '@/services/hooks/goal/goalServices'
import { useDeleteGoal } from '@/services/hooks/goal/useDeleteGoal'
import { usePatchGoal } from '@/services/hooks/goal/usePatchGoal'

type EditGoalDialogProps = {
	existingGoal: Goal
	refetchGoals: () => void
	children?: React.ReactNode
}

export const EditGoalDialog = ({ existingGoal, refetchGoals, children }: EditGoalDialogProps) => {
	const { user } = useUser()

	const form = useForm<Goal>({
		resolver: zodResolver(goalFormSchema),
		defaultValues: {
			...existingGoal,
			userId: user?.id ?? '',
		},
	})

	const updateGoalMutation = usePatchGoal({
		onSettled: () => {
			refetchGoals()
		},
	})

	const deleteMutation = useDeleteGoal({
		onSettled: () => refetchGoals(),
	})

	const onSubmit = (values: Goal) => {
		const updatedGoal = {
			...existingGoal,
			userId: user?.id ?? '',
			description: values.description,
			isCompleted: values.isCompleted ?? false,
		}
		updateGoalMutation.mutate({ goal: updatedGoal })
	}

	const dialogTrigger = <div className="hover:cursor-pointer">{children}</div>

	const inputFields = (
		<>
			<FormInputField form={form} name="description" label="Goal Description" placeholder="Edit your goal" />
			<Button
				type="button"
				variant={form.watch('isCompleted') ? 'default' : 'outline'}
				onClick={() => form.setValue('isCompleted', !form.watch('isCompleted'))}
			>
				{form.watch('isCompleted') ? 'Mark as Incomplete' : 'Mark as Complete'}
			</Button>
		</>
	)

	return (
		<BreezeFormDialog
			dialogTrigger={dialogTrigger}
			itemType="Goal"
			title="Edit Goal"
			description="Make changes to your goal here. Click 'Save Changes' when you're done."
			form={form}
			onSubmit={onSubmit}
			inputFields={inputFields}
			destructiveElements={
				<DeleteConfirmationDialog
					key={existingGoal.id}
					itemType="goal"
					onDelete={() => deleteMutation.mutate({ goal: existingGoal })}
					additionalText={<p className="text-center">Goal: {existingGoal.description}</p>}
				/>
			}
		/>
	)
}
