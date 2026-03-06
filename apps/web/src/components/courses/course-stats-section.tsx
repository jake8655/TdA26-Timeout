"use client";

import { useQuery } from "@tanstack/react-query";
import {
	BarChart3,
	ClipboardCheck,
	Download,
	Loader2,
	MousePointerClick,
	Percent,
	Trophy,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { getCoursesByCourseIdStatsOptions } from "@/api-client/@tanstack/react-query.gen";
import type { CourseStatsResponse } from "@/api-client/types.gen";
import EmptyState from "@/components/empty-state";
import { useCourseStatsStream } from "@/hooks/use-course-stats-stream";

export function CourseStatsSection({
	courseId,
	isLive,
}: {
	courseId: string;
	isLive: boolean;
}) {
	const {
		data: initialStats,
		isPending,
		isError,
	} = useQuery({
		...getCoursesByCourseIdStatsOptions({
			path: { courseId },
		}),
	});

	const { stats: streamStats, isConnected } = useCourseStatsStream(courseId, {
		enabled: isLive,
	});

	const stats: CourseStatsResponse | undefined = streamStats ?? initialStats;

	if (isPending) {
		return (
			<div className="flex justify-center py-8">
				<Loader2 className="size-6 animate-spin text-primary" />
			</div>
		);
	}

	if (isError) {
		return (
			<EmptyState
				title="Unable to load stats"
				description="Stats could not be loaded."
				icon={<BarChart3 className="size-7 text-primary" />}
			/>
		);
	}

	if (!stats) return null;

	const cards = [
		{
			label: "Total Submissions",
			value: stats.totalSubmissions,
			icon: ClipboardCheck,
			color: "text-blue-400",
			bg: "bg-blue-500/10",
		},
		{
			label: "Average Score",
			value:
				stats.totalSubmissions > 0
					? `${stats.avgScore.toFixed(1)} / ${stats.avgMaxScore.toFixed(1)}`
					: "--",
			icon: Trophy,
			color: "text-amber-400",
			bg: "bg-amber-500/10",
		},
		{
			label: "Average Percentage",
			value:
				stats.totalSubmissions > 0
					? `${stats.avgPercentage.toFixed(1)}%`
					: "--",
			icon: Percent,
			color: "text-emerald-400",
			bg: "bg-emerald-500/10",
		},
		{
			label: "Downloads",
			value: stats.downloads,
			icon: Download,
			color: "text-violet-400",
			bg: "bg-violet-500/10",
		},
		{
			label: "Site Visits",
			value: stats.siteVisits,
			icon: MousePointerClick,
			color: "text-cyan-400",
			bg: "bg-cyan-500/10",
		},
	];

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, delay: 0.15 }}
			className="space-y-3"
		>
			<div className="flex items-center justify-between">
				<h2 className="font-semibold text-foreground text-xl">Course Stats</h2>
				{isLive && isConnected && (
					<div className="flex items-center gap-2 text-muted-foreground text-xs">
						<div className="size-2 animate-pulse rounded-full bg-green-500" />
						<span>Live</span>
					</div>
				)}
			</div>

			<div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
				<AnimatePresence mode="popLayout">
					{cards.map((card, i) => (
						<motion.div
							key={card.label}
							layout
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ duration: 0.3, delay: i * 0.05 }}
							className="flex flex-col gap-2 border border-white/5 bg-card/40 p-4 backdrop-blur-sm"
						>
							<div className="flex items-center gap-2">
								<div
									className={`flex size-8 items-center justify-center rounded-lg ${card.bg}`}
								>
									<card.icon className={`size-4 ${card.color}`} />
								</div>
								<span className="text-muted-foreground text-xs">
									{card.label}
								</span>
							</div>
							<motion.p
								key={String(card.value)}
								initial={{ opacity: 0, y: 4 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.2 }}
								className="font-bold text-foreground text-xl tabular-nums"
							>
								{card.value}
							</motion.p>
						</motion.div>
					))}
				</AnimatePresence>
			</div>
		</motion.div>
	);
}
