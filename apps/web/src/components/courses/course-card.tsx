"use client";

import { ArrowRight, CalendarClock, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import type { CourseSummary } from "@/api-client";
import { CourseStatus } from "@/api-client/types.gen";
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
			exit={{ opacity: 0, scale: 0.9 }}
			transition={{ duration: 0.4, delay: index * 0.1 }}
			className="h-full"
		>
			<Link
				href={
					course.status === CourseStatus.PAUSED
						? "javasript:void(0)"
						: `/courses/${course.uuid}`
				}
				className={cn(
					"group flex h-full flex-col border border-white/5 bg-card/40 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-white/10 hover:shadow-xl",
					course.status === CourseStatus.PAUSED &&
						"pointer-events-none hover:translate-y-0 hover:border-white/5 hover:shadow-none",
				)}
			>
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
				<div className="mt-auto flex gap-2 pt-6">
					<div className="flex flex-wrap items-center gap-3 text-muted-foreground text-xs">
						{course.status === CourseStatus.PAUSED ? (
							<div className="flex items-center gap-2">
								<CalendarClock className="size-4" />
								<span>Paused until next live window</span>
							</div>
						) : course.status !== CourseStatus.ARCHIVED ? (
							<div className="flex flex-col gap-1">
								{course.status === CourseStatus.SCHEDULED &&
									course.scheduledStartAt && (
										<div className="flex items-center gap-2">
											<CalendarClock className="size-4" />
											<span>
												Starts {formatCourseTime(course.scheduledStartAt)}
											</span>
										</div>
									)}
							</div>
						) : null}
					</div>
					<div
						className={cn(
							"ml-auto flex items-center gap-2",
							course.status === CourseStatus.PAUSED && "hidden",
						)}
					>
						<p className="text-sm">{course.joined ? "Continue" : "View"}</p>
						<ArrowRight className="size-4 transition-all group-hover:-rotate-45" />
					</div>
				</div>
			</Link>
		</motion.div>
	);
}
