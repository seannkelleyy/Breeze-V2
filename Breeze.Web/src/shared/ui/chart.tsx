import * as React from 'react'

import * as RechartsPrimitive from 'recharts'

import { cn } from '@/lib/utils'

export type ChartConfig = {
	[key: string]: {
		label?: React.ReactNode
		icon?: React.ComponentType
		color?: string
	}
}

type ChartContextProps = {
	config: ChartConfig
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

const useChart = () => {
	const context = React.useContext(ChartContext)

	if (!context) {
		throw new Error('useChart must be used within a <ChartContainer />')
	}

	return context
}

const ChartContainer = React.forwardRef<
	HTMLDivElement,
	React.ComponentProps<'div'> & {
		config: ChartConfig
		children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>['children']
	}
>(({ className, children, config, ...props }, ref) => {
	const chartId = React.useId()

	return (
		<ChartContext.Provider value={{ config }}>
			<div
				data-chart={chartId}
				ref={ref}
				className={cn(
					'flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke="#fff"]]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke="#ccc"]]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-reference-line_[stroke="#ccc"]]:stroke-border [&_.recharts-sector[stroke="#fff"]]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none',
					className
				)}
				{...props}
			>
				<ChartStyle id={chartId} config={config} />
				<RechartsPrimitive.ResponsiveContainer>{children}</RechartsPrimitive.ResponsiveContainer>
			</div>
		</ChartContext.Provider>
	)
})
ChartContainer.displayName = 'ChartContainer'

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
	const colorConfig = Object.entries(config).filter(([, entry]) => entry.color)

	if (!colorConfig.length) {
		return null
	}

	return (
		<style
			dangerouslySetInnerHTML={{
				__html: Object.entries({ light: '', dark: '.dark' })
					.map(([, prefix]) => {
						const colorStyles = colorConfig.map(([key, itemConfig]) => `  --color-${key}: ${itemConfig.color};`).join('\n')
						return `${prefix} [data-chart=${id}] {\n${colorStyles}\n}`
					})
					.join('\n'),
			}}
		/>
	)
}

const ChartTooltip = RechartsPrimitive.Tooltip

type ChartTooltipContentProps = React.ComponentProps<'div'> & Partial<RechartsPrimitive.TooltipContentProps<number, string>>

const ChartTooltipContent = React.forwardRef<HTMLDivElement, ChartTooltipContentProps>(
	({ active, payload, className, label, labelFormatter, formatter }, ref) => {
		const { config } = useChart()

		if (!active || !payload?.length) {
			return null
		}

		const formattedLabel = labelFormatter ? labelFormatter(label, payload) : label

		return (
			<div
				ref={ref}
				className={cn('grid min-w-[8rem] items-start gap-1.5 rounded-lg border bg-background px-2.5 py-1.5 text-xs shadow-xl', className)}
			>
				<div className="font-medium">{formattedLabel as React.ReactNode}</div>
				<div className="grid gap-1.5">
					{payload.map((item) => {
						const itemKey = String(item.dataKey ?? item.name ?? '')
						const itemConfig = config[itemKey]
						const itemValue = formatter ? formatter(item.value, item.name, item, 0, payload) : item.value

						return (
							<div key={itemKey} className="flex items-center justify-between gap-2">
								<div className="flex items-center gap-1.5">
									<div className="size-2 rounded-[2px]" style={{ backgroundColor: item.color }} />
									<span className="text-muted-foreground">{itemConfig?.label ?? item.name}</span>
								</div>
								<span className="font-mono font-medium tabular-nums">{itemValue as React.ReactNode}</span>
							</div>
						)
					})}
				</div>
			</div>
		)
	}
)
ChartTooltipContent.displayName = 'ChartTooltipContent'

export { ChartContainer, ChartTooltip, ChartTooltipContent }
