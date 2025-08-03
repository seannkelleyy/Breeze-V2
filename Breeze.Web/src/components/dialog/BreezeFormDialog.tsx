import { useState } from 'react'

import { FieldValues, UseFormReturn } from 'react-hook-form'

import { Form } from '@/components/ui/form'

import { BreezeDialog } from './BreezeDialog'

interface BreezeFormDialogProps<TFormValues extends FieldValues> {
	dialogTrigger: React.ReactNode
	title: string
	description: string
	form: UseFormReturn<TFormValues>
	onSubmit: (values: TFormValues) => void
	inputFields: React.ReactNode
	footerActions: React.ReactNode
}

export const BreezeFormDialog = <TFormValues extends FieldValues>({
	dialogTrigger,
	title,
	description,
	form,
	onSubmit,
	inputFields,
	footerActions,
}: BreezeFormDialogProps<TFormValues>) => {
	const [open, setOpen] = useState(false)

	return (
		<BreezeDialog
			dialogTrigger={dialogTrigger}
			title={title}
			description={description}
			open={open}
			onOpenChange={setOpen}
			footerActions={footerActions}
		>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
					{inputFields}
				</form>
			</Form>
		</BreezeDialog>
	)
}
