"use client";

import { CalendarClock } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import type { CourseDetail } from "@/api-client/types.gen";
import { CourseStatusBadge } from "@/components/courses/course-status-badge";
import { formatCourseTime } from "@/lib/course-date-utils";

export function CourseHeader({ course }: { course: CourseDetail }) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4 }}
			className="space-y-4"
		>
			<div className="flex flex-wrap items-start justify-between gap-4">
				<div className="flex items-start gap-4">
					<div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 shadow-inner shadow-primary/10">
						<Image
							src="/icons/Idea/zarivka_idea_blue.svg"
							alt="Course icon"
							width={32}
							height={32}
						/>
					</div>
					<div className="space-y-2">
						<div className="flex flex-wrap items-center gap-3">
							<h1 className="font-bold text-2xl text-primary sm:text-3xl">
								{course.name}
							</h1>
							<CourseStatusBadge status={course.status} />
						</div>
						<p className="text-muted-foreground text-sm leading-relaxed">
							{course.description || (
								<span className="italic">No description available</span>
							)}
						</p>
						<div className="flex flex-wrap items-center gap-3">
							{course.scheduledStartAt && (
								<span className="inline-flex items-center gap-2 text-muted-foreground text-xs">
									<CalendarClock className="size-3.5" />
									Starts {formatCourseTime(course.scheduledStartAt)}
								</span>
							)}
						</div>
					</div>
				</div>
			</div>
		</motion.div>
	);
}
