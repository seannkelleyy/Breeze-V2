import { ReactNode, useState } from 'react'

import { FieldValues, UseFormReturn } from 'react-hook-form'

import { Form } from '@/shared/ui/form'

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
	dialogContentClassName?: string
	footerClassName?: string
	disableSubmitUntilValid?: boolean
}
/**
 * Reusable form dialog component that integrates with react-hook-form and BreezeDialog.
 * @param {ReactNode} dialogTrigger - Element that triggers the dialog when clicked.
 * @param {string} title - Title of the dialog.
 * @param {string} description - Description of the dialog.
 * @param {string} itemType - Type of the item being edited/created.
 * @param {UseFormReturn<TFormValues>} form - React Hook Form methods and state.
 * @param {(values: TFormValues) => void} onSubmit - Callback function to handle form submission.
 * @param {ReactNode} inputFields - Form fields to be rendered inside the dialog.
 * @param {ReactNode} destructiveElements - Optional destructive elements (e.g., delete buttons).
 * @returns {JSX.Element} The BreezeFormDialog component.
 */
export const BreezeFormDialog = <TFormValues extends FieldValues>({
	dialogTrigger,
	title,
	description,
	form,
	itemType,
	onSubmit,
	inputFields,
	destructiveElements,
	dialogContentClassName,
	footerClassName,
	disableSubmitUntilValid = true,
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
		<BreezeDialog
			dialogTrigger={dialogTrigger}
			title={title}
			description={description}
			open={open}
			onOpenChange={setOpen}
			dialogContentClassName={dialogContentClassName}
		>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
					{inputFields}
					<DialogFooter className={footerClassName ?? 'flex flex-row gap-2 items-center justify-center w-full'}>
						{destructiveElements ? (
							destructiveElements
						) : (
							<Button type="button" variant="outline" onClick={handleCancel}>
								Cancel
							</Button>
						)}
						<Button type="submit" disabled={form.formState.isSubmitting || (disableSubmitUntilValid && !form.formState.isValid)}>
							{form.formState.isSubmitting ? 'Saving...' : `Save ${itemType}`}
						</Button>
					</DialogFooter>
				</form>
			</Form>
		</BreezeDialog>
	)
}
