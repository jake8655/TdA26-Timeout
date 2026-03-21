import { useStore } from "@tanstack/react-form";

import { useFieldContext } from "@/hooks/form-context";

import { Field, FieldError, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";

export default function TextField({
	label,
	placeholder,
	type,
	className,
	autoComplete,
}: {
	label?: string;
	placeholder: string;
	type?: "text" | "password";
	className?: string;
	autoComplete?: string;
}) {
	const field = useFieldContext<string>();

	const errors = useStore(field.store, (state) => state.meta.errors);

	return (
		<Field data-invalid={field.state.meta.isTouched && !field.state.meta.isValid}>
			{label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}
			<Input
				id={field.name}
				name={field.name}
				value={field.state.value}
				onBlur={field.handleBlur}
				onChange={(e) => field.handleChange(e.target.value)}
				placeholder={placeholder}
				className={className}
				type={type}
				autoComplete={autoComplete}
				aria-invalid={field.state.meta.isTouched && !field.state.meta.isValid}
			/>
			{field.state.meta.isTouched && !field.state.meta.isValid && (
				<FieldError>
					{errors
						.filter((err): err is { message: string } => err !== undefined && "message" in err)
						.map((err) => err.message)
						.join(", ")}
				</FieldError>
			)}
		</Field>
	);
}
