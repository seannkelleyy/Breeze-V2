import React from 'react'

import { Budget } from '../hooks/budget/budgetServices'
import { Category } from '../hooks/category/categoryServices'
import { Expense } from '../hooks/expense/expenseServices'
import { Income } from '../hooks/income/incomeServices'

export type BudgetContextType = {
	budget: Budget
	totalSpent: number
	incomes: Income[]
	categories: Category[]
	expenses: Expense[]
	getBudgetForDate: (year: number, month: number) => Promise<{ status: number; budget?: Budget; error?: string }>
	refetchBudget: () => void
	refetchIncomes: () => void
	refetchCategories: () => void
	refetchExpenses: () => void
}

export const BudgetContext = React.createContext<BudgetContextType>({} as BudgetContextType)
