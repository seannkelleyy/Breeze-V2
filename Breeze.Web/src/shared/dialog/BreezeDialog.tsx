import { ReactNode, useState } from 'react'

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/ui/dialog'

interface BreezeDialogProps {
	dialogTrigger: ReactNode
	title: string
	description: string | ReactNode
	footerActions?: ReactNode
	children?: ReactNode
	open?: boolean
	onOpenChange?: (open: boolean) => void
}

/**
 * Reusable dialog component with consistent styling and behavior.
 * @param {ReactNode} dialogTrigger - Element that triggers the dialog when clicked.
 * @param {string} title - Title of the dialog.
 * @param {string | ReactNode} description - Description or content of the dialog.
 * @param {ReactNode} footerActions - Optional footer actions (e.g., buttons).
 * @param {ReactNode} children - Content to be displayed inside the dialog.
 * @param {boolean} open - Optional controlled open state.
 * @param {(open: boolean) => void} onOpenChange - Optional controlled open state change handler.
 * @returns {JSX.Element} The BreezeDialog component.
 */
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
