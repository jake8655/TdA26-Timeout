import { useStore } from "@tanstack/react-form";
import { Upload, X } from "lucide-react";
import { useRef } from "react";

import { useFieldContext } from "@/hooks/form-context";
import { formatFileSize, MAX_FILE_SIZE } from "@/lib/material-utils";

import { Button } from "../ui/button";
import { Field, FieldError, FieldLabel } from "../ui/field";

const ACCEPTED_FILE_TYPES = {
	documents: ".pdf,.docx,.txt",
	images: ".png,.jpg,.jpeg,.gif",
	videos: ".mp4",
	audio: ".mp3",
};

const ALL_ACCEPTED_TYPES = Object.values(ACCEPTED_FILE_TYPES).join(",");

export default function FileUploadField({
	label,
	className,
}: {
	label: string;
	className?: string;
}) {
	const field = useFieldContext<File | null>();
	const inputRef = useRef<HTMLInputElement>(null);
	const errors = useStore(field.store, (state) => state.meta.errors);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0] ?? null;
		if (file) {
			if (file.size > MAX_FILE_SIZE) {
				field.setErrorMap({
					onChange: `File size must be less than ${formatFileSize(MAX_FILE_SIZE)}`,
				});
				return;
			}
			field.handleChange(file);
		}
	};

	const handleRemove = () => {
		field.handleChange(null);
		if (inputRef.current) {
			inputRef.current.value = "";
		}
	};

	const currentFile = field.state.value;

	return (
		<Field
			data-invalid={field.state.meta.isTouched && !field.state.meta.isValid}
			className={className}
		>
			<FieldLabel htmlFor={field.name}>{label}</FieldLabel>
			<div className="flex flex-col gap-2">
				{currentFile ? (
					<div className="border-input bg-input/30 flex items-center justify-between gap-2 border px-3 py-2">
						<div className="flex min-w-0 flex-col">
							<span className="text-foreground truncate text-xs font-medium">
								{currentFile.name}
							</span>
							<span className="text-muted-foreground text-xs">
								{formatFileSize(currentFile.size)}
							</span>
						</div>
						<Button
							type="button"
							variant="ghost"
							size="icon-sm"
							onClick={handleRemove}
							className="text-muted-foreground hover:text-destructive shrink-0"
						>
							<X />
						</Button>
					</div>
				) : (
					<label
						htmlFor={field.name}
						className="border-input bg-input/10 hover:border-primary hover:bg-input/20 flex cursor-pointer flex-col items-center justify-center gap-2 border border-dashed px-4 py-6 transition-colors"
					>
						<Upload className="text-muted-foreground size-6" />
						<span className="text-muted-foreground text-xs">Click to upload or drag and drop</span>
						<span className="text-muted-foreground/70 text-xs">
							PDF, DOCX, TXT, PNG, JPG, GIF, MP4, MP3 (max 30MB)
						</span>
					</label>
				)}
				<input
					ref={inputRef}
					type="file"
					id={field.name}
					name={field.name}
					onChange={handleFileChange}
					onBlur={field.handleBlur}
					accept={ALL_ACCEPTED_TYPES}
					className="sr-only"
					aria-invalid={field.state.meta.isTouched && !field.state.meta.isValid}
				/>
			</div>
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
