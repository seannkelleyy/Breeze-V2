import { FieldValues, Path, UseFormReturn } from 'react-hook-form'

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'

type FormInputFieldProps<TFormValues extends FieldValues> = {
	form: UseFormReturn<TFormValues>
	name: Path<TFormValues>
	label: string
	placeholder?: string
	type?: string
}

export function FormInputField<TFormValues extends FieldValues>({ form, name, label, placeholder, type = 'text' }: FormInputFieldProps<TFormValues>) {
	return (
		<FormField
			control={form.control}
			name={name}
			render={({ field }) => (
				<FormItem>
					<FormLabel>{label}</FormLabel>
					<FormControl>
						<Input
							type={type}
							placeholder={placeholder}
							{...field}
							onChange={(e) => {
								const value = e.target.value
								if (type === 'number') {
									const numValue = value === '' ? 0 : parseFloat(value)
									field.onChange(isNaN(numValue) ? 0 : numValue)
								} else {
									field.onChange(value)
								}
							}}
							value={type === 'number' ? String(field.value || '') : field.value}
						/>
					</FormControl>
					<FormMessage />
				</FormItem>
			)}
		/>
	)
}
