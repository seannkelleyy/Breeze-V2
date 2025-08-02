import { FieldValues, Path, UseFormReturn } from 'react-hook-form'

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type Option = {
	value: string
	label: string
}

type FormSelectFieldProps<TFormValues extends FieldValues> = {
	form: UseFormReturn<TFormValues>
	name: Path<TFormValues>
	label: string
	options: Option[]
	placeholder?: string
}

export function FormSelectField<TFormValues extends FieldValues>({ form, name, label, options, placeholder }: FormSelectFieldProps<TFormValues>) {
	return (
		<FormField
			control={form.control}
			name={name}
			render={({ field }) => (
				<FormItem>
					<FormLabel>{label}</FormLabel>
					<FormControl>
						<Select value={String(field.value) || ''} onValueChange={(value) => field.onChange(Number(value))}>
							<SelectTrigger>
								<SelectValue placeholder={placeholder || 'Select an option'} />
							</SelectTrigger>
							<SelectContent>
								{options.map((opt) => (
									<SelectItem key={opt.value} value={opt.value}>
										{opt.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</FormControl>
					<FormMessage />
				</FormItem>
			)}
		/>
	)
}
