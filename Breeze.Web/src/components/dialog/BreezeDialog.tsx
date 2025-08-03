import { useState } from 'react'

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

interface BreezeDialogProps {
	dialogTrigger: React.ReactNode
	title: string
	description: string
	children: React.ReactNode
	footerActions?: React.ReactNode
	open?: boolean
	onOpenChange?: (open: boolean) => void
}

export const BreezeDialog = ({
	dialogTrigger,
	title,
	description,
	children,
	footerActions,
	open: controlledOpen,
	onOpenChange: controlledOnOpenChange,
}: BreezeDialogProps) => {
	const [internalOpen, setInternalOpen] = useState(false)

	const open = controlledOpen ?? internalOpen
	const onOpenChange = controlledOnOpenChange ?? setInternalOpen

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogTrigger asChild>{dialogTrigger}</DialogTrigger>
			<DialogContent className="max-w-[95%] w-fit rounded-md">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>
				{children}
				{footerActions && <DialogFooter className="flex flex-col gap-2 items-center">{footerActions}</DialogFooter>}
			</DialogContent>
		</Dialog>
	)
}
