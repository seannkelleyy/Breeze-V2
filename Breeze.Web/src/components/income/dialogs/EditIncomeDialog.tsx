import { useState } from 'react'

import { useUser } from '@clerk/clerk-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, useForm } from 'react-hook-form'
import { z } from 'zod'

import { DeleteConfirmationDialog } from '@/components/deleteConfirmation/DeleteConfirmationDialog'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Income } from '@/services/hooks/income/incomeServices'
import { useDeleteIncome } from '@/services/hooks/income/useDeleteIncome'
import { usePatchIncome } from '@/services/hooks/income/usePatchIncome'
import { useBudgetContext } from '@/services/providers/BudgetProvider'

type EditIncomeDialogProps = {
	existingIncome: Income
	children?: React.ReactNode
}

export const EditIncomeDialog = ({ existingIncome, children }: EditIncomeDialogProps) => {
	const user = useUser().user
	const [open, setOpen] = useState(false)
	const { budget, refetchIncomes, refetchBudget } = useBudgetContext()

	const defaultIncome = existingIncome || {
		userId: user?.id ?? '',
		budgetId: budget?.id ?? -1,
		name: '',
		amount: 0,
		date: new Date().toISOString().split('T')[0],
	}

	const formSchema = z.object({
		id: z.number().optional(),
		userId: z.string(),
		budgetId: z.number(),
		name: z.string().min(1, { message: 'Name is required' }),
		amount: z.coerce.number().min(0, 'Amount must be greater than 0'),
		date: z.string().refine((val) => /^\d{4}-\d{2}-\d{2}$/.test(val), {
			message: 'Invalid date format',
		}),
	})

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema) as any,
		defaultValues: defaultIncome,
	})

	const patchMutation = usePatchIncome({
		onSettled: () => {
			refetchBudget()
			refetchIncomes()
			setOpen(false)
		},
	})

	const deleteMutation = useDeleteIncome({
		onSettled: () => {
			refetchBudget()
			refetchIncomes()
			setOpen(false)
		},
	})

	const onSubmit = (values: z.infer<typeof formSchema>) => {
		patchMutation.mutate({ income: { ...values } })
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger onClick={() => setOpen(true)} className="hover:cursor-pointer">
				<div onClick={() => setOpen(true)}>{children}</div>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
						<DialogHeader>
							<DialogTitle>Edit Income</DialogTitle>
							<DialogDescription>Make changes to your income here.</DialogDescription>
						</DialogHeader>
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem className="grid grid-cols-4 items-center gap-4">
									<FormLabel className="text-right">Name</FormLabel>
									<FormControl>
										<Input id="name" type="text" {...field} className="col-span-3" />
									</FormControl>
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="amount"
							render={({ field }) => (
								<FormItem className="grid grid-cols-4 items-center gap-4">
									<FormLabel className="text-right">Amount</FormLabel>
									<FormControl>
										<Input id="amount" type="number" {...field} className="col-span-3" />
									</FormControl>
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="date"
							render={({ field }) => (
								<FormItem className="grid grid-cols-4 items-center gap-4">
									<FormLabel className="text-right">Date</FormLabel>
									<FormControl>
										<Input id="date" type="date" {...field} className="col-span-3" />
									</FormControl>
								</FormItem>
							)}
						/>
						<DialogFooter className="flex items-center">
							<DeleteConfirmationDialog
								onDelete={() => deleteMutation.mutate({ income: existingIncome })}
								additionalText={`You are about to delete the income: ${existingIncome.name}`}
								itemType={'Income'}
							/>
							<Button type="submit">Save Changes</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}
