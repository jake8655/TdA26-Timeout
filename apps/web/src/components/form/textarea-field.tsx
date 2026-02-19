import { useStore } from "@tanstack/react-form";
import { useFieldContext } from "@/hooks/form-context";
import { cn } from "@/lib/utils";
import { Field, FieldError, FieldLabel } from "../ui/field";
import { Textarea } from "../ui/textarea";

export default function TextareaField({
	label,
	placeholder,
	className,
	rows = 3,
}: {
	label: string;
	placeholder: string;
	className?: string;
	rows?: number;
}) {
	const field = useFieldContext<string>();
	const errors = useStore(field.store, (state) => state.meta.errors);

	return (
		<Field
			data-invalid={field.state.meta.isTouched && !field.state.meta.isValid}
		>
			<FieldLabel htmlFor={field.name}>{label}</FieldLabel>
			<Textarea
				id={field.name}
				name={field.name}
				value={field.state.value}
				onBlur={field.handleBlur}
				onChange={(e) => field.handleChange(e.target.value)}
				placeholder={placeholder}
				rows={rows}
				aria-invalid={field.state.meta.isTouched && !field.state.meta.isValid}
				className={cn("resize-none", className)}
			/>
			{field.state.meta.isTouched && !field.state.meta.isValid && (
				<FieldError>
					{errors
						.filter(
							(err): err is { message: string } =>
								err !== undefined && "message" in err,
						)
						.map((err) => err.message)
						.join(", ")}
				</FieldError>
			)}
		</Field>
	);
}
