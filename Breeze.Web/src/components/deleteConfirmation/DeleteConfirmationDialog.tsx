import { useState } from 'react'

import { Trash } from 'lucide-react'

import { BreezeDialog } from '../dialog/BreezeDialog'
import { Button } from '../ui/button'

type DeleteConfirmationDialogProps = {
	itemType: string
	additionalText?: string | React.ReactNode
	onDelete: () => void
}

/**
 * A reusable dialog that prompts the user to confirm deletion of an item.
 */
export const DeleteConfirmationDialog = ({ itemType, additionalText, onDelete }: DeleteConfirmationDialogProps) => {
	const [open, setOpen] = useState(false)

	const dialogTrigger = (
		<button className="hover:cursor-pointer bg-destructive w-8 h-8 p-1 rounded-md flex items-center justify-center" onClick={() => setOpen(true)}>
			<span className="sr-only">Delete</span>
			<Trash />
		</button>
	)

	const dialogDescription = (
		<>
			Are you sure you want to delete this {itemType}? This action cannot be undone.
			{additionalText && <span className="block text-center font-bold text-destructive mt-2">{additionalText}</span>}
		</>
	)

	const footerActions = (
		<div className="flex flex-row gap-2 items-center justify-center w-full">
			<Button onClick={() => setOpen(false)}>Cancel</Button>
			<Button variant="destructive" onClick={onDelete} className="hover:cursor-pointer">
				Delete
			</Button>
		</div>
	)

	return (
		<BreezeDialog
			open={open}
			onOpenChange={setOpen}
			dialogTrigger={dialogTrigger}
			title="Are you sure?"
			description={dialogDescription}
			footerActions={footerActions}
		/>
	)
}
