"use client";

import { ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import type { CourseDetail } from "@/api-client";
import { Button } from "@/components/animate-ui/components/buttons/button";

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
				</div>
				<h3 className="mb-2 font-bold text-foreground text-lg">
					{course.name}
				</h3>
				<p className="line-clamp-2 min-h-12 text-muted-foreground text-sm leading-relaxed">
					{course.description || (
						<span className="italic">No description available</span>
					)}
				</p>
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
