"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2, SearchX } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useState } from "react";
import { getCoursesOptions } from "@/api-client/@tanstack/react-query.gen";
import { CourseStatus } from "@/api-client/types.gen";
import { Button } from "@/components/animate-ui/components/buttons/button";
import BackgroundGrid from "@/components/background-grid";
import { CourseCard } from "@/components/courses/course-card";
import { SearchInput } from "@/components/courses/search-input";
import EmptyState from "@/components/empty-state";

export default function CoursesClient() {
	const [searchQuery, setSearchQuery] = useState("");
	const { data, isPending, isError, refetch } = useQuery({
		...getCoursesOptions(),
	});

	const trimmedQuery = searchQuery.trim();
	const visibleCourses = (data ?? []).filter(
		(course) => course.status !== CourseStatus.DRAFT,
	);
	const filteredCourses = !trimmedQuery
		? visibleCourses
		: visibleCourses.filter(
				(course) =>
					course.name.toLowerCase().includes(trimmedQuery.toLowerCase()) ||
					course.description
						?.toLowerCase()
						.includes(trimmedQuery.toLowerCase()),
			);
	const isFiltering = trimmedQuery.length > 0;

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
					<h1 className="mb-4 font-bold text-4xl sm:text-5xl">
						<span className="text-primary">Courses</span>
					</h1>
					<p className="mx-auto mb-8 max-w-2xl text-base text-muted-foreground sm:text-lg">
						Explore our collection of interactive courses designed to develop
						critical and creative thinking.
					</p>

					<div className="mx-auto max-w-md">
						<SearchInput
							value={searchQuery}
							onChange={setSearchQuery}
							placeholder="Search by title or description"
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
				) : isError ? (
					<EmptyState
						title="Unable to load courses"
						description="Please try again in a moment."
						icon={<SearchX className="size-7 text-primary" />}
						action={
							<Button variant="outline" size="sm" onClick={() => refetch()}>
								Retry
							</Button>
						}
					/>
				) : filteredCourses.length > 0 ? (
					<motion.div
						initial={{ opacity: isFiltering ? 1 : 0 }}
						animate={{ opacity: 1 }}
						transition={{
							duration: isFiltering ? 0.15 : 0.5,
							delay: isFiltering ? 0 : 0.3,
						}}
						className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
					>
						<AnimatePresence mode={isFiltering ? "sync" : "popLayout"}>
							{filteredCourses.map((course, index) => (
								<CourseCard
									key={course.uuid}
									course={course}
									index={isFiltering ? 0 : index}
								/>
							))}
						</AnimatePresence>
					</motion.div>
				) : (
					<EmptyState
						title="No courses found"
						description="Try adjusting your search query to find what you're looking for."
						icon={
							<Image
								src="/icons/Thinking/zarivka_thinking_blue.svg"
								alt="No results"
								width={56}
								height={56}
								className="opacity-70"
							/>
						}
						iconClassName="bg-transparent"
					/>
				)}
			</main>
		</div>
	);
}
