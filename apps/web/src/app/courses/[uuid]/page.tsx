"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, BookOpen, Loader2, MessageSquareText } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { use, useState } from "react";
import {
	getCoursesByCourseIdOptions,
	postCoursesByCourseIdJoinMutation,
	postCoursesByCourseIdSessionMutation,
} from "@/api-client/@tanstack/react-query.gen";
import { CourseStatus } from "@/api-client/types.gen";
import { Button } from "@/components/animate-ui/components/buttons/button";
import BackgroundGrid from "@/components/background-grid";
import { CourseFeed } from "@/components/courses/course-feed";
import { CourseKickDialog } from "@/components/courses/course-kick-dialog";
import { MaterialsList } from "@/components/courses/materials-list";
import EmptyState from "@/components/empty-state";
import { CourseQuizCard } from "@/components/quizzes/course-quiz-card";

export default function CourseDetailPage({
	params,
}: {
	params: Promise<{ uuid: string }>;
}) {
	const { uuid } = use(params);
	const [kickDialog, setKickDialog] = useState<{
		open: boolean;
		reason?: string;
	}>({ open: false });
	const { data, isPending, isError, refetch } = useQuery({
		...getCoursesByCourseIdOptions({
			path: { courseId: uuid },
		}),
	});
	const joinMutation = useMutation({
		...postCoursesByCourseIdJoinMutation(),
	});
	const sessionMutation = useMutation({
		...postCoursesByCourseIdSessionMutation(),
	});
	if (!isPending && !isError && !data) {
		notFound();
	}

	if (
		data?.status === CourseStatus.DRAFT ||
		data?.status === CourseStatus.ARCHIVED
	) {
		notFound();
	}

	return (
		<div className="relative min-h-screen overflow-hidden">
			<BackgroundGrid />
			<CourseKickDialog
				open={kickDialog.open}
				reason={kickDialog.reason}
				onClose={() => setKickDialog({ open: false })}
			/>

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
					<EmptyState
						title="Unable to load course"
						description="Please try again in a moment."
						icon={<MessageSquareText className="size-7 text-primary" />}
						action={
							<Button variant="outline" size="sm" onClick={() => refetch()}>
								Retry
							</Button>
						}
					/>
				) : data.status === CourseStatus.SCHEDULED ||
					data.status === CourseStatus.PAUSED ? (
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
							<div>
								<h1 className="font-bold text-2xl text-primary md:text-3xl lg:text-4xl">
									{data.name}
								</h1>
								<p className="mt-2 text-muted-foreground">
									{data.description ||
										"Course details will be available when it goes live."}
								</p>
							</div>
						</div>
						<div className="rounded-none border border-white/5 bg-card/50 p-6 text-muted-foreground">
							This course is currently {data.status}.
						</div>
					</section>
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
							<div className="ml-auto">
								{!data.joined && !joinMutation.isSuccess && (
									<Button
										variant="accent"
										disabled={
											joinMutation.isPending || sessionMutation.isPending
										}
										onClick={() => {
											sessionMutation.mutate(
												{ path: { courseId: uuid } },
												{
													onSuccess: () =>
														joinMutation.mutate({ path: { courseId: uuid } }),
												},
											);
										}}
									>
										{joinMutation.isPending || sessionMutation.isPending
											? "Joining..."
											: "Join course"}
									</Button>
								)}
								{(data.joined || joinMutation.isSuccess) && (
									<span className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 font-semibold text-[11px] text-emerald-200 uppercase tracking-wide">
										Joined
									</span>
								)}
							</div>
						</div>

						{data.joined || joinMutation.isSuccess ? (
							<>
								<div className="border-white/5 border-t pt-8">
									<h2 className="mb-4 font-semibold text-foreground text-lg">
										About this course
									</h2>
									<p className="max-w-2xl text-muted-foreground leading-relaxed">
										{data.description || (
											<span className="italic">No description available</span>
										)}
									</p>
								</div>

								<div className="mt-8">
									<div className="mb-6 flex items-center gap-3">
										<BookOpen className="size-5 text-primary" />
										<h2 className="font-semibold text-foreground text-lg">
											Course Feed
										</h2>
									</div>
									<CourseFeed
										courseId={uuid}
										onKick={(payload) =>
											setKickDialog({
												open: true,
												reason: payload.reason,
											})
										}
									/>
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

								<div className="mt-8 border-white/5 border-t pt-8">
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
										<EmptyState
											title="No quizzes yet"
											description="Check back soon for interactive quizzes."
											icon={<BookOpen className="size-7 text-primary" />}
										/>
									)}
								</div>
							</>
						) : (
							<div className="border-white/5 border-t pt-8">
								<EmptyState
									title="Join to view course content"
									description="Once you join, the feed, materials, and quizzes will unlock."
									icon={<BookOpen className="size-7 text-primary" />}
								/>
							</div>
						)}
					</section>
				)}
			</main>
		</div>
	);
}
