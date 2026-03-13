import { useEffect, useState } from 'react'

import dayjs from 'dayjs'
import { MoveLeft, MoveRight } from 'lucide-react'

import { BudgetDialog, CreateExpenseDialog, CreateIncomeDialog, ExpensesTable, Goals, IncomeTable } from '@/features/budgeting/components'
import { useBudgetContext } from '@/features/budgeting/providers'
import { isMoneyGreaterThanOrEqualWithTolerance } from '@/lib/constants'
import { Button } from '@/shared/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'

/**
 * Main page of the application displaying a budget and goals.
 * @returns {JSX.Element} The Dashboard component displaying budget overview and management options.
 */
export const Dashboard = () => {
	const { budget, getBudgetForDate } = useBudgetContext()
	const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
	const [currentYear, setCurrentYear] = useState(new Date().getFullYear())

	useEffect(() => {
		getBudgetForDate(currentYear, currentMonth)
	}, [currentMonth, currentYear, getBudgetForDate])

	const getNextBudget = () => {
		if (currentMonth === 11) {
			setCurrentMonth(0)
			setCurrentYear(currentYear + 1)
		} else {
			setCurrentMonth(currentMonth + 1)
		}
	}

	const getPreviousBudget = () => {
		if (currentMonth === 0) {
			setCurrentMonth(11)
			setCurrentYear(currentYear - 1)
		} else {
			setCurrentMonth(currentMonth - 1)
		}
	}

	const budgetDifference = (budget?.monthlyIncome ?? 0) - (budget?.monthlyExpenses ?? 0)
	const isBudgetDifferencePositive = isMoneyGreaterThanOrEqualWithTolerance(budgetDifference, 0)

	return (
		<div className="text-center pt-[10vh] max-w-xl py-4 rounded-[.5rem] overflow-x-hidden flex flex-col gap-1 justify-start items-center m-auto">
			<div className="flex gap-4 mb-4">
				<Button onClick={getPreviousBudget} title="Previous Month">
					<MoveLeft />
				</Button>
				<h1 className="text-3xl font-bold">{dayjs(new Date(currentYear, currentMonth)).format('MMMM YYYY')}</h1>
				<Button onClick={getNextBudget} title="Next Month">
					<MoveRight />
				</Button>
			</div>
			<h2 className="text-lg">
				Income: $ <span className="text-accent font-bold">{budget?.monthlyIncome ?? 'Loading...'}</span>
			</h2>
			<h2 className="text-lg">
				Expenses: $ <span className="text-accent font-bold">{budget?.monthlyExpenses ?? 'Loading...'}</span>
			</h2>
			<h2 className="text-lg">
				Difference: ${' '}
				<span className={isBudgetDifferencePositive ? 'p-1 rounded-sm bg-success' : ' p-1 rounded-sm bg-destructive'}>{budgetDifference}</span>
			</h2>
			<div className="flex gap-4 pt-4 flex-wrap justify-center items-center">
				<CreateIncomeDialog />
				<CreateExpenseDialog />
				<BudgetDialog />
			</div>
			<Goals />
			<Tabs defaultValue="expenses" className="flex flex-col justify-center items-center m-4">
				<TabsList>
					<TabsTrigger value="expenses">Expenses</TabsTrigger>
					<TabsTrigger value="income">Incomes</TabsTrigger>
				</TabsList>
				<TabsContent value="expenses">
					<ExpensesTable />
				</TabsContent>
				<TabsContent value="income">
					<IncomeTable />
				</TabsContent>
			</Tabs>
		</div>
	)
}
