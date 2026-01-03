"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useState } from "react";
import { getCoursesOptions } from "@/api-client/@tanstack/react-query.gen";
import BackgroundGrid from "@/components/background-grid";
import { CourseCard } from "@/components/courses/course-card";
import { SearchInput } from "@/components/courses/search-input";

export default function CoursesPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const { data, isPending } = useQuery({
		...getCoursesOptions(),
	});

	const filteredCourses = !searchQuery.trim()
		? (data ?? [])
		: (data ?? []).filter(
				(course) =>
					course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
					course.description?.toLowerCase().includes(searchQuery.toLowerCase()),
			);

	return (
		<div className="relative min-h-screen overflow-hidden">
			<BackgroundGrid />

			<main className="relative z-10 mx-auto max-w-7xl px-6 pt-32 pb-24">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className="mb-12 text-center"
				>
					<h1 className="mb-6 font-bold text-4xl sm:text-5xl">
						<span className="text-primary">Courses</span>
					</h1>
					<p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
						Explore our collection of interactive courses designed to develop
						critical and creative thinking.
					</p>

					<div className="mx-auto max-w-md">
						<SearchInput
							value={searchQuery}
							onChange={setSearchQuery}
							placeholder="Search by title or description..."
						/>
					</div>
				</motion.div>

				{isPending ? (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.5 }}
						className="text-center text-muted-foreground"
					>
						<Loader2 className="mx-auto size-16 animate-spin text-primary" />
					</motion.div>
				) : filteredCourses.length > 0 ? (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.5, delay: 0.3 }}
						className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
					>
						<AnimatePresence mode="popLayout">
							{filteredCourses.map((course, index) => (
								<CourseCard key={course.uuid} course={course} index={index} />
							))}
						</AnimatePresence>
					</motion.div>
				) : (
					<motion.div
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.4 }}
						className="border border-white/5 bg-card/50 p-12 text-center"
					>
						<div className="mb-6 flex justify-center">
							<Image
								src="/icons/Thinking/zarivka_thinking_blue.svg"
								alt="No results"
								width={80}
								height={80}
								className="size-20 opacity-50"
							/>
						</div>
						<h2 className="mb-2 font-semibold text-muted-foreground text-xl">
							No courses found
						</h2>
						<p className="text-muted-foreground text-sm">
							Try adjusting your search query to find what you're looking for.
						</p>
					</motion.div>
				)}
			</main>
		</div>
	);
}
