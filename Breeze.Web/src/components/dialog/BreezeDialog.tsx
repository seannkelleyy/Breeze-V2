import { ReactNode, useState } from 'react'

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

interface BreezeDialogProps {
	dialogTrigger: ReactNode
	title: string
	description: string | ReactNode
	footerActions?: ReactNode
	children?: ReactNode
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
			<DialogContent className="max-w-[95%] md:max-w-[400px] rounded-md max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>
				{children}
				{footerActions && <DialogFooter>{footerActions}</DialogFooter>}
			</DialogContent>
		</Dialog>
	)
}
