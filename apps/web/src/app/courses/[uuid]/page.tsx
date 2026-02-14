"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, BookOpen, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { use } from "react";
import { getCoursesByCourseIdOptions } from "@/api-client/@tanstack/react-query.gen";
import { Button } from "@/components/animate-ui/components/buttons/button";
import BackgroundGrid from "@/components/background-grid";
import { CourseFeed } from "@/components/courses/course-feed";
import { MaterialsList } from "@/components/courses/materials-list";
import { CourseQuizCard } from "@/components/quizzes/course-quiz-card";

export default function CourseDetailPage({
	params,
}: {
	params: Promise<{ uuid: string }>;
}) {
	const { uuid } = use(params);
	const { data, isPending, isError } = useQuery({
		...getCoursesByCourseIdOptions({
			path: { courseId: uuid },
		}),
	});

	if (!isPending && !isError && !data) {
		notFound();
	}

	return (
		<div className="relative min-h-screen overflow-hidden">
			<BackgroundGrid />

			<main className="relative z-10 mx-auto max-w-4xl px-6 pt-32 pb-24">
				<motion.div
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.4 }}
					className="mb-8"
				>
				<Button
					variant="ghost"
					size="sm"
					className="text-muted-foreground hover:text-primary dark:hover:bg-transparent"
					asChild
				>
					<Link href="/courses">
						<ArrowLeft />
						Back to Courses
					</Link>
				</Button>
				</motion.div>

				{isPending ? (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.5 }}
						className="flex justify-center"
					>
						<Loader2 className="size-16 animate-spin text-primary" />
					</motion.div>
				) : isError ? (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.5 }}
						className="text-center text-muted-foreground"
					>
						<p>Failed to load course details. Please try again later.</p>
					</motion.div>
				) : (
					<section className="border border-white/5 bg-card/40 p-8 backdrop-blur-sm md:p-12">
						<div className="mb-8 flex items-center gap-6">
							<div className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-primary/10 shadow-inner shadow-primary/10 md:size-20">
								<Image
									src="/icons/Idea/zarivka_idea_blue.svg"
									alt="Course icon"
									width={40}
									height={40}
									className="size-10 md:size-12"
								/>
							</div>
							<h1 className="font-bold text-2xl text-primary md:text-3xl lg:text-4xl">
								{data.name}
							</h1>
						</div>

						<div className="border-white/5 border-t pt-8">
							<h2 className="mb-4 font-semibold text-foreground text-lg">
								About this course
							</h2>
							<p className="text-muted-foreground leading-relaxed">
								{data.description ?? (
									<span className="italic">No description available</span>
								)}
							</p>
						</div>

						<div className="mt-8">
							<div className="mb-6 flex items-center gap-3">
								<BookOpen className="size-5 text-primary" />
								<h2 className="font-semibold text-foreground text-lg">
									Quizzes
								</h2>
							</div>
							{data.quizzes && data.quizzes.length > 0 ? (
								<div className="flex flex-col gap-3">
									{data.quizzes.map((quiz) => (
										<CourseQuizCard
											key={quiz.uuid ?? quiz.title}
											quiz={quiz}
											courseId={uuid}
											onSaveResult={() => {}}
										/>
									))}
								</div>
							) : (
								<p className="text-muted-foreground">
									No quizzes available for this course.
								</p>
							)}
						</div>

						<div className="mt-8 border-white/5 border-t pt-8">
							<div className="mb-6 flex items-center gap-3">
								<BookOpen className="size-5 text-primary" />
								<h2 className="font-semibold text-foreground text-lg">
									Course Feed
								</h2>
							</div>
							<CourseFeed courseId={uuid} />
						</div>

						<div className="mt-8 border-white/5 border-t pt-8">
							<div className="mb-6 flex items-center gap-3">
								<BookOpen className="size-5 text-primary" />
								<h2 className="font-semibold text-foreground text-lg">
									Course Materials
								</h2>
							</div>
							<MaterialsList courseId={uuid} />
						</div>
					</section>
				)}
			</main>
		</div>
	);
}
