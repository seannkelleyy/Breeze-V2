import * as React from 'react'

import {
	ColumnDef,
	ColumnFiltersState,
	SortingState,
	VisibilityState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getSortedRowModel,
	useReactTable,
} from '@tanstack/react-table'
import dayjs from 'dayjs'
import { ArrowUpDown } from 'lucide-react'

import { Income } from '@/features/budgeting/hooks/income/incomeServices'
import { useBudgetContext } from '@/features/budgeting/providers'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'

import { EditIncomeDialog } from './dialogs/EditIncomeDialog'

/**
 * IncomeTable component for displaying a list of incomes.
 * @returns {JSX.Element} The IncomeTable component that displays a list of incomes.
 */
export const IncomeTable = () => {
	const [sorting, setSorting] = React.useState<SortingState>([])
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
	const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
	const [rowSelection, setRowSelection] = React.useState({})
	const { incomes = [] } = useBudgetContext()

	const columns = React.useMemo<ColumnDef<Income>[]>(
		() => [
			{
				accessorKey: 'name',
				header: ({ column }) => {
					return (
						<Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
							Name
							<ArrowUpDown />
						</Button>
					)
				},
			},
			{
				accessorKey: 'amount',
				header: ({ column }) => {
					return (
						<Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
							Amount
							<ArrowUpDown />
						</Button>
					)
				},
				cell: ({ row }) => {
					const amount = parseFloat(row.getValue('amount'))
					const formatted = new Intl.NumberFormat('en-US', {
						style: 'currency',
						currency: 'USD',
					}).format(amount)
					return <div className="text-left font-medium">{formatted}</div>
				},
			},
			{
				accessorKey: 'date',
				header: ({ column }) => {
					return (
						<Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
							Date
							<ArrowUpDown />
						</Button>
					)
				},
				cell: ({ row }) => {
					const date = row.getValue('date') as string | number | Date | null | undefined
					return dayjs(date).format('MMMM D, YYYY')
				},
			},
		],
		[]
	)

	// Calculate total amount
	const totalAmount = React.useMemo(() => {
		return incomes.reduce((sum, income) => sum + income.amount, 0)
	}, [incomes])

	const table = useReactTable({
		data: incomes ?? [],
		columns,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onColumnVisibilityChange: setColumnVisibility,
		onRowSelectionChange: setRowSelection,
		state: {
			sorting,
			columnFilters,
			columnVisibility,
			rowSelection,
		},
	})

	return (
		<section title="Incomes" className="w-full ">
			<Input
				placeholder="Filter names..."
				value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
				onChange={(event) => table.getColumn('name')?.setFilterValue(event.target.value)}
				className="w-full my-2"
			/>
			<div className="flex justify-between items-center mb-2">
				<span className="text-sm text-muted-foreground">Total Incomes: {incomes.length}</span>
				<span className="text-sm font-medium">
					Total Amount:{' '}
					{new Intl.NumberFormat('en-US', {
						style: 'currency',
						currency: 'USD',
					}).format(totalAmount)}
				</span>
			</div>
			<section className="max-h-96 overflow-auto rounded-md border" title="Incomes Table">
				<Table className="w-full table-fixed">
					<TableHeader className="w-full">
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<TableHead key={header.id}>
										{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
									</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows?.length > 0 ? (
							table.getRowModel().rows.map((row) => (
								<TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											<EditIncomeDialog existingIncome={row.original}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</EditIncomeDialog>
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow className="w-full">
								<TableCell colSpan={columns.length} className="h-24 text-center w-full">
									No results.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</section>
		</section>
	)
}
