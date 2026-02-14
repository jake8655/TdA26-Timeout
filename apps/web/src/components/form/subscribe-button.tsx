import { Loader2 } from "lucide-react";
import { useFormContext } from "@/hooks/form-context";
import { Button } from "../animate-ui/components/buttons/button";

export default function SubscribeButton({
	label,
	className,
}: {
	label: string;
	className?: string;
}) {
	const form = useFormContext();

	return (
		<form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
			{([canSubmit, isSubmitting]) => (
				<Button
					type="submit"
					disabled={!canSubmit || isSubmitting}
					variant="accent"
					className={className}
				>
					{isSubmitting ? (
						<>
							<Loader2 className="animate-spin" />
							Loading
						</>
					) : (
						label
					)}
				</Button>
			)}
		</form.Subscribe>
	);
}
