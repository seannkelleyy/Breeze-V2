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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Expense } from '@/services/hooks/expense/expenseServices'
import { useDeleteExpense } from '@/services/hooks/expense/useDeleteExpense'
import { usePatchExpense } from '@/services/hooks/expense/usePatchExpense'
import { useBudgetContext } from '@/services/providers/BudgetProvider'

type EditExpenseDialogProps = {
	existingExpense: Expense
	children?: React.ReactNode
}

export const EditExpenseDialog = ({ existingExpense, children }: EditExpenseDialogProps) => {
	const user = useUser().user
	const [open, setOpen] = useState(false)
	const { budget, categories, refetchCategories, refetchBudget, refetchExpenses } = useBudgetContext()

	const defaultExpense = existingExpense || {
		userId: user?.id ?? '',
		categoryId: categories[0]?.id ?? 1,
		name: '',
		amount: 0,
		date: new Date().toISOString().split('T')[0],
	}

	const formSchema = z.object({
		id: z.number().optional(),
		userId: z.string(),
		name: z.string().min(1, { message: 'Name is required' }),
		categoryId: z.number().min(1, { message: 'Category is required' }),
		amount: z.coerce.number().min(0, 'Amount must be greater than 0'),
		date: z.string().refine((val) => /^\d{4}-\d{2}-\d{2}$/.test(val), {
			message: 'Invalid date format',
		}),
	})

	const form = useForm({
		resolver: zodResolver(formSchema),
		defaultValues: defaultExpense,
	})

	const patchMutation = usePatchExpense({
		onSettled: () => {
			refetchBudget()
			refetchCategories()
			refetchExpenses()
			setOpen(false)
		},
	})

	const deleteMutation = useDeleteExpense({
		onSettled: () => {
			refetchBudget()
			refetchCategories()
			refetchExpenses()
			setOpen(false)
		},
	})

	const onSubmit = (values: z.infer<typeof formSchema>) => {
		patchMutation.mutate({ budgetId: budget?.id, expense: { ...values } })
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
							<DialogTitle>Edit Expense</DialogTitle>
							<DialogDescription>Make changes to your expense here. Click save when you're done.</DialogDescription>
						</DialogHeader>
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem className="grid grid-cols-4 items-center gap-4">
									<FormLabel className="text-right">Name</FormLabel>
									<FormControl>
										<Input {...field} className="col-span-3" />
									</FormControl>
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="categoryId"
							render={({ field }) => (
								<FormItem className="grid grid-cols-4 items-center gap-4">
									<FormLabel className="text-right">Category</FormLabel>
									<FormControl>
										<Select value={field.value?.toString() || ''} onValueChange={(value) => field.onChange(Number(value))}>
											<SelectTrigger className="col-span-3">
												<SelectValue>{categories.find((category) => category.id === field.value)?.name || 'Select a category'}</SelectValue>
											</SelectTrigger>
											<SelectContent className="bg-background">
												{categories.map((category) => (
													<SelectItem key={category.id} value={String(category.id)}>
														{category.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
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
										<Input
											{...field}
											className="col-span-3"
											type="number"
											value={typeof field.value === 'number' || typeof field.value === 'string' ? field.value : ''}
										/>
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
										<Input {...field} className="col-span-3" type="date" />
									</FormControl>
								</FormItem>
							)}
						/>
						<DialogFooter className="flex items-center">
							<DeleteConfirmationDialog
								onDelete={() => deleteMutation.mutate({ budgetId: budget.id, expense: existingExpense })}
								itemType="Expense"
								additionalText={`You are about to delete the expense: ${existingExpense.name}`}
							/>
							<Button type="submit">Save Changes</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}
