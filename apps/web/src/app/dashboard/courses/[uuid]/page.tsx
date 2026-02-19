"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, HelpCircle, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { use } from "react";
import {
	deleteCoursesByCourseIdMutation,
	getCoursesByCourseIdMaterialsOptions,
	getCoursesByCourseIdQuizzesOptions,
	getCoursesLecturerByCourseIdOptions,
	postCoursesByCourseIdArchiveMutation,
	postCoursesByCourseIdDuplicateMutation,
	postCoursesByCourseIdPauseMutation,
	postCoursesByCourseIdStartMutation,
	putCoursesByCourseIdStatusMutation,
} from "@/api-client/@tanstack/react-query.gen";
import { CourseStatus } from "@/api-client/types.gen";
import { Button } from "@/components/animate-ui/components/buttons/button";
import BackgroundGrid from "@/components/background-grid";
import { CourseActions } from "@/components/courses/course-actions";
import { CourseFeed } from "@/components/courses/course-feed";
import { CourseHeader } from "@/components/courses/course-header";
import { CourseMaterialsSection } from "@/components/courses/course-materials-section";
import { CourseQuizzesSection } from "@/components/courses/course-quizzes-section";
import { DeleteFeedPostButton } from "@/components/courses/delete-feed-post-dialog";
import {
	CreateFeedPostButton,
	EditFeedPostButton,
} from "@/components/courses/feed-post-form-dialog";
import EmptyState from "@/components/empty-state";
import LoadingPlaceholder from "@/components/loading-placeholder";
import { useRequireAuth } from "@/hooks/use-require-auth";

export default function DashboardCourseDetailPage({
	params,
}: {
	params: Promise<{ uuid: string }>;
}) {
	const { uuid } = use(params);
	const { data: authData } = useRequireAuth();
	const router = useRouter();
	const queryClient = useQueryClient();

	const {
		data: course,
		isPending: courseLoading,
		isError: courseError,
		refetch: refetchCourse,
	} = useQuery({
		...getCoursesLecturerByCourseIdOptions({
			path: { courseId: uuid },
		}),
	});

	const {
		data: materials,
		isPending: materialsLoading,
		isError: materialsError,
		refetch: refetchMaterials,
	} = useQuery({
		...getCoursesByCourseIdMaterialsOptions({
			path: { courseId: uuid },
		}),
	});

	const {
		data: quizzes,
		isPending: quizzesLoading,
		isError: quizzesError,
		refetch: refetchQuizzes,
	} = useQuery({
		...getCoursesByCourseIdQuizzesOptions({
			path: { courseId: uuid },
		}),
	});

	const kickMutation = useMutation({
		...postCoursesByCourseIdPauseMutation(),
	});
	const startMutation = useMutation({
		...postCoursesByCourseIdStartMutation(),
	});
	const archiveMutation = useMutation({
		...postCoursesByCourseIdArchiveMutation(),
	});
	const statusMutation = useMutation({
		...putCoursesByCourseIdStatusMutation(),
	});
	const duplicateMutation = useMutation({
		...postCoursesByCourseIdDuplicateMutation(),
		onSuccess: (data) => {
			if (data?.uuid) {
				router.push(`/dashboard/courses/${data.uuid}`);
			}
		},
	});
	const deleteMutation = useMutation({
		...deleteCoursesByCourseIdMutation(),
	});

	if (!authData) {
		return <LoadingPlaceholder />;
	}

	if (!courseLoading && !courseError && !course) {
		notFound();
	}

	return (
		<section className="relative min-h-screen overflow-hidden pt-28 pb-16">
			<BackgroundGrid />

			<div className="relative z-10 mx-auto max-w-4xl space-y-8 px-6">
				<motion.div
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.4 }}
				>
					<Button
						variant="ghost"
						size="sm"
						className="text-muted-foreground hover:text-primary dark:hover:bg-transparent"
						asChild
					>
						<Link href="/dashboard">
							<ArrowLeft />
							Back to Dashboard
						</Link>
					</Button>
				</motion.div>

				{courseLoading ? (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						className="flex justify-center py-12"
					>
						<Loader2 className="size-16 animate-spin text-primary" />
					</motion.div>
				) : courseError ? (
					<EmptyState
						title="Unable to load course"
						description="Please try again in a moment."
						icon={<HelpCircle className="size-7 text-primary" />}
						action={
							<Button
								variant="outline"
								size="sm"
								onClick={() => refetchCourse()}
							>
								Retry
							</Button>
						}
					/>
				) : course ? (
					<>
						<div className="space-y-4 border border-white/5 bg-card/40 p-6 backdrop-blur-sm">
							<CourseHeader course={course} />
							<CourseActions
								course={course}
								duplicatePending={duplicateMutation.isPending}
								deletePending={deleteMutation.isPending}
								onSchedule={(payload) =>
									statusMutation.mutate({
										path: { courseId: uuid },
										body: {
											status: "scheduled",
											scheduledStartAt: payload.scheduledStartAt,
											scheduledEndAt: payload.scheduledEndAt,
										},
									})
								}
								onStart={(endAt) =>
									startMutation.mutate({
										path: { courseId: uuid },
										body: { scheduledEndAt: endAt },
									})
								}
								onPause={() =>
									kickMutation.mutate({
										path: { courseId: uuid },
										body: {},
									})
								}
								onArchive={() =>
									archiveMutation.mutate({
										path: { courseId: uuid },
									})
								}
								onMoveToDraft={() =>
									statusMutation.mutate({
										path: { courseId: uuid },
										body: { status: "draft" },
									})
								}
								onDuplicate={(name) =>
									duplicateMutation.mutate({
										path: { courseId: uuid },
										body: { name },
									})
								}
								onDelete={() => {
									deleteMutation.mutate({
										path: { courseId: uuid },
										// @ts-expect-error server requires a JSON body
										body: {},
									});
									// This is very cursed, do NOT do this or repeat this pattern
									// It should be done in the onSuccess callback of the mutation, but all queries are invalidated (and the invalidation is awaited) on every mutation which causes the current (deleted) course's data to be refetched but it does not exist anymore so it throws an error
									router.push("/dashboard");
								}}
							/>
						</div>

						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: 0.1 }}
							className="flex items-center justify-between"
						>
							<h2 className="font-semibold text-foreground text-xl">
								Course Feed
							</h2>
							<CreateFeedPostButton
								courseId={uuid}
								disabled={course.status !== CourseStatus.DRAFT}
							/>
						</motion.div>

						<CourseFeed
							courseId={uuid}
							showActions
							editTrigger={(item) => (
								<EditFeedPostButton post={item} courseId={uuid} />
							)}
							deleteTrigger={(item) => (
								<DeleteFeedPostButton post={item} courseId={uuid} />
							)}
							onKick={() => queryClient.invalidateQueries()}
						/>

						<CourseMaterialsSection
							course={course}
							materials={materials}
							loading={materialsLoading}
							error={materialsError}
							onRetry={() => refetchMaterials()}
						/>

						<CourseQuizzesSection
							course={course}
							quizzes={quizzes}
							loading={quizzesLoading}
							error={quizzesError}
							onRetry={() => refetchQuizzes()}
						/>
					</>
				) : null}
			</div>
		</section>
	);
}
