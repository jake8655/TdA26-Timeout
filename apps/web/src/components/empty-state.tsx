"use client";

import { motion } from "motion/react";
import type React from "react";
import { cn } from "@/lib/utils";

export default function EmptyState({
	title,
	description,
	icon,
	action,
	className,
}: {
	title: string;
	description?: string;
	icon?: React.ReactNode;
	action?: React.ReactNode;
	className?: string;
}) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4 }}
			className={cn(
				"rounded-none border border-white/10 bg-card/40 p-8 text-center backdrop-blur-sm",
				className,
			)}
		>
			{icon && (
				<div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
					{icon}
				</div>
			)}
			<h3 className="font-semibold text-foreground text-lg">{title}</h3>
			{description && (
				<p className="mt-2 text-muted-foreground text-sm leading-relaxed">
					{description}
				</p>
			)}
			{action && <div className="mt-6 flex justify-center">{action}</div>}
		</motion.div>
	);
}
