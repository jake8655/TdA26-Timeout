"use client";

import { Archive, CalendarClock, FileText, PauseCircle, Radio } from "lucide-react";

import type { CourseStatus } from "@/api-client/types.gen";
import { cn } from "@/lib/utils";

const statusMeta: Record<
	CourseStatus,
	{ label: string; icon: typeof CalendarClock; className: string }
> = {
	draft: {
		label: "Draft",
		icon: FileText,
		className: "border-white/10 bg-white/5 text-muted-foreground",
	},
	scheduled: {
		label: "Scheduled",
		icon: CalendarClock,
		className: "border-amber-500/30 bg-amber-500/10 text-amber-200",
	},
	live: {
		label: "Live",
		icon: Radio,
		className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
	},
	paused: {
		label: "Paused",
		icon: PauseCircle,
		className: "border-slate-400/30 bg-slate-500/10 text-slate-200",
	},
	archived: {
		label: "Archived",
		icon: Archive,
		className: "border-stone-400/30 bg-stone-500/10 text-stone-200",
	},
};

export function CourseStatusBadge({
	status,
	className,
}: {
	status?: CourseStatus;
	className?: string;
}) {
	if (!status) return null;
	const meta = statusMeta[status];
	const Icon = meta.icon;

	return (
		<span
			className={cn(
				"inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold tracking-wide uppercase",
				meta.className,
				className,
			)}
		>
			<Icon className="size-3.5" />
			{meta.label}
		</span>
	);
}
