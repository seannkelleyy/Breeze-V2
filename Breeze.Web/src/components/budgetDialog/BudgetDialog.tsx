import { useEffect, useState } from 'react'

import { useUser } from '@clerk/clerk-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { BudgetFormData, budgetFormSchema } from '@/services/hooks/budget/budgetServices'
import { useDeleteCategory } from '@/services/hooks/category/useDeleteCategory'
import { usePatchCategory } from '@/services/hooks/category/usePatchCategory'
import { usePostCategory } from '@/services/hooks/category/usePostCategory'
import { useDeleteIncome } from '@/services/hooks/income/useDeleteIncome'
import { usePatchIncome } from '@/services/hooks/income/usePatchIncome'
import { usePostIncome } from '@/services/hooks/income/usePostIncome'
import { useBudgetContext } from '@/services/providers/BudgetProvider'

import { BreezeFormDialog } from '../dialog/BreezeFormDialog'
import { BudgetExpenseItem } from './BudgetExpenseItem'
import { BudgetIncomeItem } from './BudgetIncomeItem'

export const BudgetDialog = () => {
	const { user } = useUser()
	const { budget, categories, incomes, refetchCategories, refetchBudget, refetchIncomes } = useBudgetContext()
	const [open, setOpen] = useState(false)

	const form = useForm<BudgetFormData>({
		resolver: zodResolver(budgetFormSchema),
		defaultValues: {
			incomes: incomes.map(({ id, name, budgetId, amount, date }) => ({ id, name, budgetId, amount, date })),
			categories: categories.map(({ id, name, budgetId, currentSpend, allocation }) => ({ id, name, budgetId, currentSpend, allocation })),
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
	const deleteCategoryMutation = useDeleteCategory({ onSettled: () => refetchCategories() })
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
	const deleteIncomeMutation = useDeleteIncome({ onSettled: () => refetchIncomes() })

	const handleDeleteCategory = (index: number) => {
		const category = form.getValues().categories[index]
		if (category.id !== -1) {
			deleteCategoryMutation.mutate({ category: { ...category, userId: user?.id ?? '', budgetId: budget.id } })
		}
		form.setValue(
			'categories',
			form.getValues().categories.filter((_, i) => i !== index)
		)
	}

	const handleDeleteIncome = (index: number) => {
		const income = form.getValues().incomes[index]
		if (income.id !== -1) {
			deleteIncomeMutation.mutate({ income: { ...income, userId: user?.id ?? '', budgetId: budget.id } })
		}
		form.setValue(
			'incomes',
			form.getValues().incomes.filter((_, i) => i !== index)
		)
	}

	const onSubmit = (values: BudgetFormData) => {
		if (!user?.id || !budget?.id) return
		values.categories.forEach((category) => {
			const payload = { ...category, userId: user.id, budgetId: budget.id }
			category.id && category.id !== -1
				? patchCategoryMutation.mutate({ category: payload })
				: category.name.trim() && category.allocation > 0 && postCategoryMutation.mutate({ category: payload })
		})
		values.incomes.forEach((income) => {
			const payload = { ...income, userId: user.id, budgetId: budget.id }
			income.id && income.id !== -1
				? patchIncomeMutation.mutate({ income: payload })
				: income.name.trim() && income.amount > 0 && postIncomeMutation.mutate({ budgetId: budget.id, income: payload })
		})
		setOpen(false)
	}

	const totalIncome = form.watch('incomes').reduce((sum, income) => sum + (Number(income.amount) || 0), 0)
	const totalExpenses = form.watch('categories').reduce((sum, category) => sum + (Number(category.allocation) || 0), 0)

	useEffect(() => {
		if (open && incomes.length > 0 && categories.length > 0) {
			form.reset({
				incomes: incomes.map((i) => ({ ...i })),
				categories: categories.map((c) => ({ ...c })),
			})
		}
	}, [open, incomes, categories, form])

	const inputFields = (
		<>
			<h1 className="text-lg font-bold">
				Total Budget: $
				<span className={totalIncome - totalExpenses >= 0 ? 'p-1 rounded-sm bg-success' : 'p-1 rounded-sm bg-destructive'}>
					{totalIncome - totalExpenses}
				</span>
			</h1>
			<section className="grid gap-2 py-4 mt-2">
				<h2 className="text-xl font-bold">Estimated Incomes</h2>
				<h3 className="font-bold">Total Income: ${totalIncome}</h3>
				<div className="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_auto] gap-2 text-sm text-muted-foreground">
					<span>Name</span>
					<span>Amount</span>
					<span>Date</span>
					<span className="text-right">Actions</span>
				</div>
				{form.watch('incomes').map((_, index) => (
					<BudgetIncomeItem key={index} index={index} form={form} deleteIncome={handleDeleteIncome} />
				))}
				<Button
					type="button"
					onClick={() => {
						form.setValue(
							'incomes',
							[
								...form.getValues().incomes,
								{ userId: user?.id ?? '', budgetId: budget.id, name: '', amount: 0, date: new Date().toISOString().split('T')[0] },
							],
							{ shouldValidate: false }
						)
					}}
				>
					Add Income
				</Button>
			</section>
			<section className="grid gap-2 py-4 mt-2">
				<h2 className="text-xl font-bold">Estimated Expenses</h2>
				<h3 className="font-bold">Total Expenses: ${totalExpenses}</h3>
				<div className="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)_auto] gap-2 text-sm text-muted-foreground">
					<span>Name</span>
					<span>Allocation</span>
					<span className="text-right">Actions</span>
				</div>
				{form.watch('categories').map((_, index) => (
					<BudgetExpenseItem key={index} index={index} form={form} deleteCategory={handleDeleteCategory} />
				))}
				<Button
					type="button"
					onClick={() => {
						form.setValue(
							'categories',
							[...form.getValues().categories, { userId: user?.id ?? '', name: '', budgetId: budget.id, currentSpend: 0, allocation: 0 }],
							{ shouldValidate: false }
						)
					}}
				>
					Add Expense
				</Button>
			</section>
		</>
	)

	return (
		<BreezeFormDialog
			dialogTrigger={<Button onClick={() => setOpen(true)}>Edit Budget</Button>}
			title="Edit Budget"
			itemType="Budget"
			description="Add and edit your estimated incomes and expenses."
			form={form}
			onSubmit={onSubmit}
			inputFields={inputFields}
		/>
	)
}
