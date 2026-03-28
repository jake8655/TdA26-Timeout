"use client";

import { ArrowRight, CalendarClock } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";

import type { CourseSummary } from "@/api-client";
import { CourseStatus } from "@/api-client/types.gen";
import { CourseStatusBadge } from "@/components/courses/course-status-badge";
import { useAuth } from "@/hooks/use-auth";
import { formatCourseTime } from "@/lib/course-date-utils";
import { getCoursePath } from "@/lib/tenant-routing";
import { cn } from "@/lib/utils";

export function CourseCard({ course, index }: { course: CourseSummary; index: number }) {
	const { data: authData } = useAuth();

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
						: getCoursePath(authData, course.uuid)
				}
				className={cn(
					"group bg-card/40 flex h-full flex-col border border-white/5 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-white/10 hover:shadow-xl",
					course.status === CourseStatus.PAUSED &&
						"pointer-events-none hover:translate-y-0 hover:border-white/5 hover:shadow-none",
				)}
			>
				<div className="mb-4 flex items-start justify-between">
					<div className="bg-primary/10 shadow-primary/10 flex size-12 items-center justify-center rounded-xl shadow-inner">
						<Image
							src="/icons/Idea/zarivka_idea_blue.svg"
							alt="Course icon"
							width={28}
							height={28}
							className="size-7"
						/>
					</div>
					<CourseStatusBadge status={course.status} />
				</div>
				<h3 className="text-foreground mb-2 text-lg font-bold">{course.name}</h3>
				<p className="text-muted-foreground line-clamp-2 min-h-12 text-sm leading-relaxed">
					{course.description || <span className="italic">No description available</span>}
				</p>
				<div className="mt-auto flex gap-2 pt-6">
					<div className="text-muted-foreground flex flex-wrap items-center gap-3 text-xs">
						{course.status === CourseStatus.PAUSED ? (
							<div className="flex items-center gap-2">
								<CalendarClock className="size-4" />
								<span>Paused until next live window</span>
							</div>
						) : course.status !== CourseStatus.ARCHIVED ? (
							<div className="flex flex-col gap-1">
								{course.status === CourseStatus.SCHEDULED && course.scheduledStartAt && (
									<div className="flex items-center gap-2">
										<CalendarClock className="size-4" />
										<span>Starts {formatCourseTime(course.scheduledStartAt)}</span>
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
						<p className="text-sm">Open</p>
						<ArrowRight className="size-4 transition-all group-hover:-rotate-45" />
					</div>
				</div>
			</Link>
		</motion.div>
	);
}
