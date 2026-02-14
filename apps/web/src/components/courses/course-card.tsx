"use client";

import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import type { CourseDetail } from "@/api-client";

export function CourseCard({
	course,
	index,
}: {
	course: CourseDetail;
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
		>
			<Link href={`/courses/${course.uuid}`}>
				<div className="group h-full cursor-pointer border border-white/5 bg-card/40 p-6 backdrop-blur-sm transition-all duration-300 hover:border-white/10 hover:shadow-xl">
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
					</div>

					<h3 className="mb-2 font-bold text-lg text-foreground">
						{course.name}
					</h3>

					<p className="line-clamp-3 text-muted-foreground text-sm leading-relaxed">
						{course.description || (
							<span className="italic">No description available</span>
						)}
					</p>
				</div>
			</Link>
		</motion.div>
	);
}
