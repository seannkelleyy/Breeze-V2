import { useEffect, useState } from 'react'

import { useUser } from '@clerk/clerk-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form } from '@/components/ui/form'
import { BudgetFormData, budgetFormSchema } from '@/services/hooks/budget/budgetServices'
import { useDeleteCategory } from '@/services/hooks/category/useDeleteCategory'
import { usePatchCategory } from '@/services/hooks/category/usePatchCategory'
import { usePostCategory } from '@/services/hooks/category/usePostCategory'
import { useDeleteIncome } from '@/services/hooks/income/useDeleteIncome'
import { usePatchIncome } from '@/services/hooks/income/usePatchIncome'
import { usePostIncome } from '@/services/hooks/income/usePostIncome'
import { useBudgetContext } from '@/services/providers/BudgetProvider'

import { BudgetExpenseItem } from './BudgetExpenseItem'
import { BudgetIncomeItem } from './BudgetIncomeItem'

//TODO: Change expenses to be expense categories
//TODO: Change income verbage to say that this is expected income and that you should add it when it is deposited.
export const BudgetDialog = () => {
	const [open, setOpen] = useState<boolean>(false)
	const { user } = useUser()
	const { budget, categories, incomes, refetchCategories, refetchBudget, refetchIncomes } = useBudgetContext()

	const form = useForm<BudgetFormData>({
		resolver: zodResolver(budgetFormSchema),
		defaultValues: {
			incomes: incomes.map((income) => ({
				id: income.id,
				name: income.name,
				amount: income.amount,
				date: income.date,
			})),
			categories: categories.map((category) => ({
				id: category.id,
				name: category.name,
				budgetId: category.budgetId,
				currentSpend: category.currentSpend,
				allocation: category.allocation,
			})),
		},
	})

	const postCategoryMutation = usePostCategory({
		onSettled: () => {
			refetchBudget()
			refetchCategories()
		},
	})

	const patchCategoryMutation = usePatchCategory({
		onSettled: () => {
			refetchBudget()
			refetchCategories()
		},
	})

	const deleteCategoryMutation = useDeleteCategory({
		onSettled: () => refetchCategories(),
	})

	const postIncomeMutation = usePostIncome({
		onSettled: () => {
			refetchBudget()
			refetchIncomes()
		},
	})

	const patchIncomeMutation = usePatchIncome({
		onSettled: () => {
			refetchBudget()
			refetchIncomes()
		},
	})

	const deleteIncomeMutation = useDeleteIncome({
		onSettled: () => refetchIncomes(),
	})

	const handleDeleteCategory = (index: number) => {
		const categoryToDelete = form.getValues().categories[index]
		if (categoryToDelete.id !== -1) {
			deleteCategoryMutation.mutate({
				category: {
					...categoryToDelete,
					userId: user?.id ?? '',
					budgetId: budget.id,
				},
			})
		}
		const updatedCategories = form.getValues().categories.filter((_, i) => i !== index)
		form.setValue('categories', updatedCategories)
	}

	const handleDeleteIncome = (index: number) => {
		const incomeToDelete = form.getValues().incomes[index]
		if (incomeToDelete.id !== -1) {
			deleteIncomeMutation.mutate({
				income: {
					...incomeToDelete,
					userId: user?.id ?? '',
					budgetId: budget.id,
				},
			})
		}
		const updatedIncomes = form.getValues().incomes.filter((_, i) => i !== index)
		form.setValue('incomes', updatedIncomes)
	}

	const onSubmit = (values: BudgetFormData) => {
		if (!user?.id || !budget?.id) return null

		console.log('Submitting budget form:', values)

		// 		Submitting budget form:

		// categories: Array (2)
		// 0
		// {name: "Lulah", budgetId: 12, currentSpend: 1231, allocation: 500}
		// 1
		// {name: "afsdf", budgetId: 12, currentSpend: 0, allocation: 2323}

		// incomes: Array (3)
		// 0
		// {name: "Sean", amount: 1239, date: "2025-08-15"}
		// 1
		// {name: "Laugh", amount: 2123, date: "2025-08-02"}
		// 2
		// {name: "Lula's Money", amount: 2200, date: "2025-08-02"}

		values.categories.forEach((category) => {
			if (category.id && category.id !== -1) {
				patchCategoryMutation.mutate({
					category: {
						...category,
						userId: user.id,
						budgetId: budget.id,
					},
				})
			} else if (category.name.trim() && category.allocation > 0) {
				postCategoryMutation.mutate({
					category: {
						...category,
						userId: user.id,
						budgetId: budget.id,
					},
				})
			}
		})

		values.incomes.forEach((income) => {
			if (income.id && income.id !== -1) {
				patchIncomeMutation.mutate({
					income: {
						...income,
						userId: user.id,
						budgetId: budget.id,
					},
				})
			} else if (income.name.trim() && income.amount > 0) {
				postIncomeMutation.mutate({
					budgetId: budget.id,
					income: {
						...income,
						userId: user.id,
						budgetId: budget.id,
					},
				})
			}
		})

		setOpen(false)
	}

	const totalIncome = Number((form.getValues().incomes ?? []).reduce((sum, income) => sum + (Number(income.amount) || 0), 0))
	const totalExpenses = Number((form.getValues().categories ?? []).reduce((sum, category) => sum + (Number(category.allocation) || 0), 0))

	useEffect(() => {
		if (open && incomes.length > 0 && categories.length > 0) {
			form.reset({
				incomes: incomes.map((income) => ({
					id: income.id,
					userId: income.userId,
					budgetId: income.budgetId,
					name: income.name,
					amount: income.amount,
					date: income.date,
				})),
				categories: categories.map((category) => ({
					id: category.id,
					userId: category.userId,
					name: category.name,
					budgetId: category.budgetId,
					currentSpend: category.currentSpend,
					allocation: category.allocation,
				})),
			})
		}
	}, [open])

	const handleOpenChange = (open: boolean) => {
		setOpen(open)
		form.reset()
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<Button onClick={() => setOpen(true)}>Edit Budget</Button>
			<DialogContent className="max-h-[80vh] overflow-y-auto max-w-[95%] w-fit rounded-md">
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)}>
						<DialogHeader>
							<DialogTitle className="text-2xl">Edit Budget</DialogTitle>
							<DialogDescription>Add and edit your estimated incomes and expenses.</DialogDescription>
							<h1 className="text-lg font-bold">
								Total Budget: $
								{
									<span className={totalIncome - totalExpenses >= 0 ? 'p-1 rounded-sm bg-success' : ' p-1 rounded-sm bg-destructive'}>
										{totalIncome - totalExpenses}
									</span>
								}
							</h1>
						</DialogHeader>
						<section title="Budget Incomes" className="grid gap-2 py-4 mt-2">
							<h2 className="text-xl font-bold">Estimated Incomes</h2>
							<h3 className="font-bold">Total Income: ${totalIncome}</h3>
							{form.watch('incomes').map((income, index) => (
								<BudgetIncomeItem key={income.id ?? index} index={index} form={form} deleteIncome={handleDeleteIncome} />
							))}
							<Button
								type="button"
								onClick={() => {
									const updatedIncomes = [
										...form.getValues().incomes,
										{ id: -1, userId: '', budgetId: budget.id, name: '', amount: 0, date: new Date().toISOString().split('T')[0] },
									]
									form.setValue('incomes', updatedIncomes, { shouldValidate: false })
								}}
							>
								Add Income
							</Button>
						</section>
						<section title="Budget Expenses" className="grid gap-2 py-4 mt-2">
							<h2 className="text-xl font-bold">Estimated Expenses</h2>
							<h3 className="font-bold">Total Expenses: ${totalExpenses}</h3>
							{form.watch('categories').map((category, index) => (
								<BudgetExpenseItem key={category.id ?? index} index={index} form={form} deleteCategory={handleDeleteCategory} />
							))}
							<Button
								type="button"
								onClick={() => {
									const updatedCategories = [
										...form.getValues().categories,
										{ id: -1, userId: '', name: '', budgetId: budget.id, currentSpend: 0, allocation: 0 },
									]
									form.setValue('categories', updatedCategories, { shouldValidate: false })
								}}
							>
								Add Expense
							</Button>
						</section>
						<DialogFooter>
							<Button type="submit">Save Budget</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}
