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

/**
 * FormSelectField component for rendering a controlled select dropdown.
 * @param {UseFormReturn<TFormValues>} form - React Hook Form methods and state.
 * @param {Path<TFormValues>} name - Name of the form field.
 * @param {string} label - Label for the select field.
 * @param {Option[]} options - Options for the select dropdown.
 * @param {string} placeholder - Placeholder text for the select field.
 * @returns {JSX.Element} The rendered select field component.
 */
export const FormSelectField = <TFormValues extends FieldValues>({ form, name, label, options, placeholder }: FormSelectFieldProps<TFormValues>) => {
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
