import { FieldValues, Path, UseFormReturn } from 'react-hook-form'

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'

type FormInputFieldProps<TFormValues extends FieldValues> = {
	form: UseFormReturn<TFormValues>
	name: Path<TFormValues>
	label: string
	placeholder?: string
	type?: string
	hideLabel?: boolean
}

/**
 * FormInputField component for rendering a controlled input field.
 * @param {UseFormReturn<TFormValues>} form - React Hook Form methods and state.
 * @param {Path<TFormValues>} name - Name of the form field.
 * @param {string} label - Label for the input field.
 * @param {string} placeholder - Placeholder text for the input field.
 * @param {string} type - Type of the input field (e.g., text, number).
 * @param {boolean} hideLabel - Whether to visually hide the label (for accessibility).
 * @returns {JSX.Element} The rendered input field component.
 */
export const FormInputField = <TFormValues extends FieldValues>({
	form,
	name,
	label,
	placeholder,
	type = 'text',
	hideLabel = false,
}: FormInputFieldProps<TFormValues>) => {
	return (
		<FormField
			control={form.control}
			name={name}
			render={({ field }) => (
				<FormItem>
					{hideLabel ? <FormLabel className="sr-only">{label}</FormLabel> : <FormLabel>{label}</FormLabel>}
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
