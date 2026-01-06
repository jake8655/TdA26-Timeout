import { useStore } from "@tanstack/react-form";
import { useFieldContext } from "@/hooks/form-context";
import { cn } from "@/lib/utils";
import { Field, FieldError, FieldLabel } from "../ui/field";

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
			<textarea
				id={field.name}
				name={field.name}
				value={field.state.value}
				onBlur={field.handleBlur}
				onChange={(e) => field.handleChange(e.target.value)}
				placeholder={placeholder}
				rows={rows}
				aria-invalid={field.state.meta.isTouched && !field.state.meta.isValid}
				className={cn(
					"w-full min-w-0 resize-none rounded-none border border-input bg-transparent px-2.5 py-2 text-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive/20 dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
					className,
				)}
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
