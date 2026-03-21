"use client";

import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/animate-ui/components/buttons/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

export function CourseKickDialog({
	open,
	reason,
	redirectTo,
	onClose,
}: {
	open: boolean;
	reason?: string;
	redirectTo?: string;
	onClose: () => void;
}) {
	const router = useRouter();

	return (
		<Dialog
			open={open}
			onOpenChange={(value) => {
				if (!value) {
					onClose();
				}
			}}
			disablePointerDismissal
		>
			<DialogContent
				className="overflow-hidden sm:max-w-md"
				showCloseButton={false}
			>
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3 }}
					className="space-y-5"
				>
					<DialogHeader>
						<DialogTitle>You’ve been removed from this course</DialogTitle>
						<DialogDescription>
							{reason ??
								"This course is no longer available right now. Come back when it goes live again."}
						</DialogDescription>
					</DialogHeader>
					<div className="rounded-none border border-white/5 bg-card/50 p-4 text-muted-foreground text-sm">
						If this seems wrong, return to Courses and try opening it again.
					</div>
					<div className="flex justify-end">
						<Button
							variant="accent"
							onClick={() => {
								onClose();
								router.push(redirectTo ?? "/courses");
							}}
						>
							Go to Courses
						</Button>
					</div>
				</motion.div>
			</DialogContent>
		</Dialog>
	);
}
