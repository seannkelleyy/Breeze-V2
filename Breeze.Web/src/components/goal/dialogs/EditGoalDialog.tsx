import { useState } from 'react'

import { useUser } from '@clerk/clerk-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Pencil } from 'lucide-react'
import { useForm } from 'react-hook-form'

import { DeleteConfirmationDialog } from '@/components/deleteConfirmation/DeleteConfirmationDialog'
import { FormInputField } from '@/components/form/FormInputField'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form } from '@/components/ui/form'
import { Goal, goalFormSchema } from '@/services/hooks/goal/goalServices'
import { useDeleteGoal } from '@/services/hooks/goal/useDeleteGoal'
import { usePatchGoal } from '@/services/hooks/goal/usePatchGoal'

type EditGoalDialogProps = {
	existingGoal: Goal
	refetchGoals: () => void
}

export const EditGoalDialog = ({ existingGoal, refetchGoals }: EditGoalDialogProps) => {
	const { user } = useUser()
	const [open, setOpen] = useState(false)

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
			setOpen(false)
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

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger onClick={() => setOpen(true)}>
				<Pencil />
			</DialogTrigger>
			<DialogContent className="max-w-[95%] w-fit rounded-md">
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
						<DialogHeader>
							<DialogTitle>Edit Goal</DialogTitle>
							<DialogDescription>Make changes to your goal here. Click "Save Changes" when you’re done.</DialogDescription>
						</DialogHeader>
						<FormInputField form={form} name="description" label="Goal Description" placeholder="Edit your goal" />
						<DialogFooter className="flex justify-between items-center w-full">
							<DeleteConfirmationDialog
								itemType="goal"
								onDelete={() => deleteMutation.mutate({ goal: existingGoal })}
								additionalText={<p className="text-center">Goal: {existingGoal.description}</p>}
							/>
							<Button
								type="button"
								variant={form.watch('isCompleted') ? 'default' : 'outline'}
								onClick={() => form.setValue('isCompleted', !form.watch('isCompleted'))}
							>
								{form.watch('isCompleted') ? 'Mark as Incomplete' : 'Mark as Complete'}
							</Button>
							<Button type="submit">Save Changes</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}
