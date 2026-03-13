import { useContext } from 'react'

import { BudgetContext } from './BudgetContext'

export const useBudgetContext = () => useContext(BudgetContext)
