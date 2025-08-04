import { ReactNode, useState } from 'react'

import { FieldValues, UseFormReturn } from 'react-hook-form'

import { Form } from '@/components/ui/form'

import { Button } from '../ui/button'
import { DialogFooter } from '../ui/dialog'
import { BreezeDialog } from './BreezeDialog'

interface BreezeFormDialogProps<TFormValues extends FieldValues> {
	dialogTrigger: ReactNode
	title: string
	description: string
	itemType: string
	form: UseFormReturn<TFormValues>
	onSubmit: (values: TFormValues) => void
	inputFields: ReactNode
	destructiveElements?: ReactNode
}

export const BreezeFormDialog = <TFormValues extends FieldValues>({
	dialogTrigger,
	title,
	description,
	form,
	itemType,
	onSubmit,
	inputFields,
	destructiveElements,
}: BreezeFormDialogProps<TFormValues>) => {
	const [open, setOpen] = useState<boolean>(false)

	const handleSubmit = () => {
		onSubmit(form.getValues())
		form.reset()
		setOpen(false)
	}

	const handleCancel = () => {
		form.reset()
		setOpen(false)
	}

	return (
		<BreezeDialog dialogTrigger={dialogTrigger} title={title} description={description} open={open} onOpenChange={setOpen}>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-2">
					{inputFields}
					<DialogFooter className="flex flex-row gap-2 items-center justify-center w-full">
						{destructiveElements ? (
							destructiveElements
						) : (
							<Button type="button" variant="outline" onClick={handleCancel}>
								Cancel
							</Button>
						)}
						<Button type="submit" disabled={!form.formState.isValid || form.formState.isSubmitting}>
							{form.formState.isSubmitting ? 'Saving...' : `Save ${itemType}`}
						</Button>
					</DialogFooter>
				</form>
			</Form>
		</BreezeDialog>
	)
}
