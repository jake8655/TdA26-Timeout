"use client";

import { ArrowUpRight, CalendarClock } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import type { CourseSummary } from "@/api-client";
import { CourseStatus } from "@/api-client/types.gen";
import { Button } from "@/components/animate-ui/components/buttons/button";

const COURSE_TIMEZONE = "Europe/Bratislava";

export function CourseCard({
	course,
	index,
}: {
	course: CourseSummary;
	index: number;
}) {
	return (
		<motion.div
			layout
			initial={{ opacity: 0, scale: 0.9 }}
			animate={{ opacity: 1, scale: 1 }}
			whileHover={{ y: -5 }}
			exit={{ opacity: 0, scale: 0.9 }}
			transition={{ duration: 0.4, delay: index * 0.1 }}
			className="h-full"
		>
			<div className="group flex h-full flex-col border border-white/5 bg-card/40 p-6 backdrop-blur-sm transition-all duration-300 hover:border-white/10 hover:shadow-xl">
				<div className="mb-4 flex items-start justify-between">
					<div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 shadow-inner shadow-primary/10">
						<Image
							src="/icons/Idea/zarivka_idea_blue.svg"
							alt="Course icon"
							width={28}
							height={28}
							className="size-7"
						/>
					</div>
					{course.status && (
						<span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-semibold text-[11px] text-muted-foreground uppercase tracking-wide">
							{course.status}
						</span>
					)}
				</div>
				<h3 className="mb-2 font-bold text-foreground text-lg">
					{course.name}
				</h3>
				<p className="line-clamp-2 min-h-12 text-muted-foreground text-sm leading-relaxed">
					{course.description || (
						<span className="italic">No description available</span>
					)}
				</p>
				{course.status === CourseStatus.SCHEDULED &&
					course.scheduledStartAt && (
						<div className="mt-4 flex items-center gap-2 text-muted-foreground text-xs">
							<CalendarClock className="size-4" />
							<span>Starts {formatCourseTime(course.scheduledStartAt)}</span>
						</div>
					)}
				{course.status === CourseStatus.PAUSED && (
					<div className="mt-4 flex items-center gap-2 text-muted-foreground text-xs">
						<CalendarClock className="size-4" />
						<span>Paused until next live window</span>
					</div>
				)}
				<div className="mt-auto flex items-center justify-end pt-6">
					<Button
						variant="outline"
						size="sm"
						className="border-white/10 text-muted-foreground hover:border-primary/30 hover:text-primary"
						asChild
					>
						<Link href={`/courses/${course.uuid}`}>
							<ArrowUpRight className="size-4" />
							View
						</Link>
					</Button>
				</div>
			</div>
		</motion.div>
	);
}

function formatCourseTime(value: string) {
	const date = new Date(value);
	return date.toLocaleString("en-GB", {
		timeZone: COURSE_TIMEZONE,
		weekday: "short",
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}
