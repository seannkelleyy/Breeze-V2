import { useState } from 'react'

import { useUser } from '@clerk/clerk-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { FormInputField } from '@/components/form/FormInputField'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form } from '@/components/ui/form'
import { Goal, goalFormSchema } from '@/services/hooks/goal/goalServices'
import { usePostGoal } from '@/services/hooks/goal/usePostGoal'

type CreateGoalDialogProps = {
	refetchGoals: () => void
}

export const CreateGoalDialog = ({ refetchGoals }: CreateGoalDialogProps) => {
	const [open, setOpen] = useState(false)
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
			setOpen(false)
		},
	})

	const onSubmit = (values: Goal) => {
		if (!user?.id) return

		postGoalMutation.mutate({
			goal: {
				userId: user?.id ?? '',
				description: values.description,
				isCompleted: false,
			},
		})
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button className="w-fit self-center">Create Goal</Button>
			</DialogTrigger>
			<DialogContent className="max-w-[95%] w-fit rounded-md">
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
						<DialogHeader>
							<DialogTitle>Create Goal</DialogTitle>
							<DialogDescription>Create a new goal. Click save when you’re done.</DialogDescription>
						</DialogHeader>
						<FormInputField form={form} name="description" label="Goal Description" placeholder="Enter your goal" />
						<DialogFooter>
							<Button type="submit">Create Goal</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}
