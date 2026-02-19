"use client";

import { ArrowUpRight, CalendarClock, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import type { CourseSummary } from "@/api-client";
import { CourseStatus } from "@/api-client/types.gen";
import { Button } from "@/components/animate-ui/components/buttons/button";
import { CourseStatusBadge } from "@/components/courses/course-status-badge";
import { formatCourseTime } from "@/lib/course-date-utils";
import { cn } from "@/lib/utils";

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
			<div className="group flex h-full flex-col border border-white/5 bg-card/40 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-white/10 hover:shadow-xl">
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
					<div className="flex flex-col items-end gap-2">
						<CourseStatusBadge status={course.status} />
						{course.joined && (
							<span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-semibold text-[11px] text-emerald-200 uppercase tracking-wide">
								<CheckCircle2 className="size-3.5" />
								Joined
							</span>
						)}
					</div>
				</div>
				<h3 className="mb-2 font-bold text-foreground text-lg">
					{course.name}
				</h3>
				<p className="line-clamp-2 min-h-12 text-muted-foreground text-sm leading-relaxed">
					{course.description || (
						<span className="italic">No description available</span>
					)}
				</p>
				<div className="mt-auto flex items-center justify-between pt-6">
					{course.status === CourseStatus.SCHEDULED &&
						course.scheduledStartAt && (
							<div className="flex items-center gap-2 text-muted-foreground text-xs">
								<CalendarClock className="size-4" />
								<span>Starts {formatCourseTime(course.scheduledStartAt)}</span>
							</div>
						)}
					{course.status === CourseStatus.PAUSED && (
						<div className="flex items-center gap-2 text-muted-foreground text-xs">
							<CalendarClock className="size-4" />
							<span>Paused until next live window</span>
						</div>
					)}
					<Button
						variant={course.joined ? "accent" : "outline"}
						size="sm"
						className={cn(
							"ml-auto",
							!course.joined &&
								"border-white/10 text-muted-foreground hover:border-primary/30 hover:text-primary",
						)}
						asChild
					>
						<Link href={`/courses/${course.uuid}`}>
							<ArrowUpRight className="size-4" />
							{course.joined ? "Continue" : "View"}
						</Link>
					</Button>
				</div>
			</div>
		</motion.div>
	);
}
